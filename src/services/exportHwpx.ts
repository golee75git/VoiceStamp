import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { resolveImageUri } from './fileService';
import { renderHwpxFromTemplate } from './hwpxTemplate';
import { stampCoordinatesLine } from './stampCoords';
import { getCoordsLabelMode } from './settingsService';
import type { ExportFileResult } from './exportProject';
import type { Stamp } from '../types/stamp';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const reportTemplateAsset = require('../../assets/templates/report.hwpx');

function sanitizeExportBaseName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ');
  return cleaned || 'VoiceStamp';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function downloadBlobOnWeb(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function loadReportTemplateBytes(): Promise<ArrayBuffer> {
  if (Platform.OS === 'web') {
    const response = await fetch('/templates/report.hwpx');
    if (!response.ok) {
      throw new Error('HWPX 템플릿을 불러오지 못했습니다.');
    }
    return response.arrayBuffer();
  }

  const asset = Asset.fromModule(reportTemplateAsset);
  await asset.downloadAsync();
  const uri = asset.localUri;
  if (!uri) {
    throw new Error('HWPX 템플릿 경로를 찾지 못했습니다.');
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bytes = base64ToUint8Array(base64);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function readImageBytes(
  imagePath: string,
): Promise<{ data: Uint8Array; format: 'jpg' | 'png' }> {
  const uri = resolveImageUri(imagePath);
  const format = imagePath.toLowerCase().endsWith('.png') ? 'png' : 'jpg';

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return { data: new Uint8Array(arrayBuffer), format };
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { data: base64ToUint8Array(base64), format };
}

function formatFloor(floor: string | null | undefined): string {
  if (!floor) {
    return '';
  }
  return `${floor}층`;
}

async function buildHwpxBytes(stamps: Stamp[], reportTitle: string): Promise<Uint8Array> {
  const coordsLabel = await getCoordsLabelMode();
  const templateBytes = await loadReportTemplateBytes();
  const stampFills: import('./hwpxTemplate').HwpxStampFill[] = [];

  for (const stamp of stamps) {
    const coords = stampCoordinatesLine(stamp, coordsLabel) ?? '';
    const floorText = formatFloor(stamp.floor);
    const placeText = stamp.placeLabel?.trim() ?? '';
    const metaParts = [
      placeText,
      floorText,
      coords,
      new Date(stamp.createdAt).toLocaleString('ko-KR'),
    ].filter(Boolean);

    const { data, format } = await readImageBytes(stamp.imagePath);
    stampFills.push({
      title: stamp.title,
      memo: stamp.memo,
      meta: metaParts.join(' · '),
      imageBytes: data,
      imageExt: format,
    });
  }

  return renderHwpxFromTemplate(
    templateBytes,
    reportTitle.trim() || 'VoiceStamp 보고서',
    new Date().toLocaleString('ko-KR'),
    stampFills,
  );
}

export async function createStampsHwpx(
  stamps: Stamp[],
  fileName: string,
  reportTitle = '',
): Promise<ExportFileResult> {
  if (stamps.length === 0) {
    throw new Error('보낼 스탬프가 없습니다.');
  }

  const safeName = sanitizeExportBaseName(fileName);
  const hwpxFileName = `${safeName}.hwpx`;
  const bytes = await buildHwpxBytes(stamps, reportTitle);
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

  if (Platform.OS === 'web') {
    const blob = new Blob([arrayBuffer], { type: 'application/hwp+zip' });
    const webBlobUrl = URL.createObjectURL(blob);
    return { uri: 'web', fileName: hwpxFileName, webBlobUrl };
  }

  const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!dir) {
    throw new Error('저장 경로를 사용할 수 없습니다.');
  }

  const hwpxPath = `${dir}${hwpxFileName}`;
  await FileSystem.writeAsStringAsync(hwpxPath, arrayBufferToBase64(arrayBuffer), {
    encoding: FileSystem.EncodingType.Base64,
  });

  return { uri: hwpxPath, fileName: hwpxFileName };
}

export async function shareStampsHwpx(result: ExportFileResult): Promise<void> {
  if (Platform.OS === 'web') {
    if (!result.webBlobUrl) {
      throw new Error('다운로드 파일을 준비하지 못했습니다.');
    }
    const response = await fetch(result.webBlobUrl);
    const blob = await response.blob();
    downloadBlobOnWeb(blob, result.fileName);
    return;
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('공유 기능을 사용할 수 없습니다.');
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: 'application/hwp+zip',
    dialogTitle: 'HWPX 파일 공유',
  });
}
