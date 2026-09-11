import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { buildCaptionTableRows } from './captionTable';
import { resolveImageUri } from './fileService';
import { resolveFieldLabels } from './fieldLabels';
import { buildHwpxCaptionPack } from './hwpxCaptionPack';
import {
  resolveOverlayFooterPhrase,
  resolveOverlayOrgName,
} from './overlayText';
import { formatStampFooterDatetime } from './pdfTitleFormat';
import {
  getCoordsLabelMode,
  getExportFooterDatetime,
  getExtra1FieldLabel,
  getExtra2FieldLabel,
  getExtra3FieldLabel,
  getMemoFieldLabel,
  getOverlayFooterPhrase,
  getOverlayOrgName,
  getOverlayShowFooterPhrase,
  getOverlayShowOrgName,
  getPdfPhotosPerPage,
  getPdfShowDatetime,
  getPlaceFieldLabel,
  getTitleFieldLabel,
} from './settingsService';
import { writeUint8ArrayToCacheFile } from './writeCacheFile';
import type { ExportFileResult } from './exportProject';
import type { Stamp } from '../types/stamp';

function sanitizeExportBaseName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ');
  return cleaned || 'VoiceStamp';
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

/**
 * PDF 별도 영역과 같은 정보를 표로 만든다.
 * 첫 행은 사진, 아래는 표시명|내용, 기관명·하단 문구·촬영일시는 값이 있을 때만 가로 한 줄.
 */
function buildCaptionStamp(
  stamp: Stamp,
  options: {
    showDatetime: boolean;
    showFooterDatetime: boolean;
    coordsLabel: Awaited<ReturnType<typeof getCoordsLabelMode>>;
    fieldLabels: ReturnType<typeof resolveFieldLabels>;
    orgName: string;
    footerPhrase: string;
    showOrgName: boolean;
    showFooterPhrase: boolean;
  },
): { orgName: string; rows: { label: string; value: string }[]; footerPhrase: string; footerDate: string } {
  const org =
    resolveOverlayOrgName({
      orgName: options.orgName,
      footerPhrase: options.footerPhrase,
      showOrgName: options.showOrgName,
      showFooterPhrase: options.showFooterPhrase,
    }) ?? '';

  const rows = buildCaptionTableRows(stamp, options.fieldLabels, {
    showDatetime: options.showDatetime,
    coordsLabel: options.coordsLabel,
    includeCoords: true,
  });

  const phrase =
    resolveOverlayFooterPhrase({
      orgName: options.orgName,
      footerPhrase: options.footerPhrase,
      showOrgName: options.showOrgName,
      showFooterPhrase: options.showFooterPhrase,
    }) ?? '';
  const footerDate = options.showFooterDatetime
    ? formatStampFooterDatetime(stamp.createdAt)
    : '';

  return {
    orgName: org,
    rows,
    footerPhrase: phrase,
    footerDate,
  };
}

async function buildHwpxBytes(stamps: Stamp[], reportTitle: string): Promise<Uint8Array> {
  const [
    photosPerPage,
    coordsLabel,
    showDatetime,
    showFooterDatetime,
    orgName,
    footerPhrase,
    showOrgName,
    showFooterPhrase,
    titleFieldLabel,
    placeFieldLabel,
    memoFieldLabel,
    extra1FieldLabel,
    extra2FieldLabel,
    extra3FieldLabel,
  ] = await Promise.all([
    getPdfPhotosPerPage(),
    getCoordsLabelMode(),
    getPdfShowDatetime(),
    getExportFooterDatetime(),
    getOverlayOrgName(),
    getOverlayFooterPhrase(),
    getOverlayShowOrgName(),
    getOverlayShowFooterPhrase(),
    getTitleFieldLabel(),
    getPlaceFieldLabel(),
    getMemoFieldLabel(),
    getExtra1FieldLabel(),
    getExtra2FieldLabel(),
    getExtra3FieldLabel(),
  ]);

  const fieldLabels = resolveFieldLabels({
    titleFieldLabel,
    placeFieldLabel,
    memoFieldLabel,
    extra1FieldLabel,
    extra2FieldLabel,
    extra3FieldLabel,
  });

  const captionStamps = [];

  for (const stamp of stamps) {
    const caption = buildCaptionStamp(stamp, {
      showDatetime,
      showFooterDatetime,
      coordsLabel,
      fieldLabels,
      orgName,
      footerPhrase,
      showOrgName,
      showFooterPhrase,
    });
    const { data, format } = await readImageBytes(stamp.imagePath);
    captionStamps.push({
      ...caption,
      imageBytes: data,
      imageExt: format,
    });
  }

  return buildHwpxCaptionPack(
    reportTitle.trim() || 'VoiceStamp 보고서',
    new Date().toLocaleString('ko-KR'),
    captionStamps,
    photosPerPage,
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

  const hwpxPath = writeUint8ArrayToCacheFile(bytes, hwpxFileName);
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
