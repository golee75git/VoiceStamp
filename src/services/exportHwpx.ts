import { HWPXBuilder, write } from 'hwpx-js';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { resolveImageUri } from './fileService';
import { stampCoordinatesLine } from './stampCoords';
import { getCoordsLabelMode } from './settingsService';
import type { ExportFileResult } from './exportProject';
import type { Stamp } from '../types/stamp';

const IMAGE_WIDTH_MM = 140;
const IMAGE_HEIGHT_MM = 105;

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

async function readImageBytes(
  imagePath: string,
): Promise<{ data: Uint8Array; format: 'jpeg' | 'png' }> {
  const uri = resolveImageUri(imagePath);
  const format = imagePath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';

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
  const builder = new HWPXBuilder();
  const title = reportTitle.trim() || 'VoiceStamp 보고서';

  builder.addParagraph(title, { fontSize: 18, bold: true });
  builder.addParagraph(`생성: ${new Date().toLocaleString('ko-KR')}`, { fontSize: 10 });
  builder.addEmptyParagraph();

  for (let i = 0; i < stamps.length; i++) {
    const stamp = stamps[i];
    const coords = stampCoordinatesLine(stamp, coordsLabel) ?? '';
    const floorText = formatFloor(stamp.floor);
    const metaParts = [
      floorText,
      coords,
      new Date(stamp.createdAt).toLocaleString('ko-KR'),
    ].filter(Boolean);

    builder.addParagraph(`${i + 1}. ${stamp.title}`, { fontSize: 14, bold: true });

    if (stamp.memo.trim()) {
      builder.addParagraph(stamp.memo);
    }

    if (metaParts.length > 0) {
      builder.addParagraph(metaParts.join(' · '), { fontSize: 10 });
    }

    try {
      const { data, format } = await readImageBytes(stamp.imagePath);
      builder.addImage(data, format, {
        width: IMAGE_WIDTH_MM,
        height: IMAGE_HEIGHT_MM,
      });
    } catch {
      builder.addParagraph('(이미지 없음)', { fontSize: 10 });
    }

    builder.addEmptyParagraph();
  }

  return write(builder.build());
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
