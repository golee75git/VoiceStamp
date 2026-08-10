import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { resolveImageUri } from './fileService';
import { stampCoordinatesLine } from './stampCoords';
import { getCoordsLabelMode } from './settingsService';
import { writeUint8ArrayToCacheFile } from './writeCacheFile';
import {
  DEFAULT_FIELD_EXTRA1_LABEL,
  DEFAULT_FIELD_EXTRA2_LABEL,
  DEFAULT_FIELD_EXTRA3_LABEL,
  DEFAULT_FIELD_MEMO_LABEL,
  DEFAULT_FIELD_PLACE_LABEL,
  DEFAULT_FIELD_TITLE_LABEL,
  resolveFieldLabels,
} from './fieldLabels';
import { listStampFieldTemplatesForFilter, findStampFieldTemplate } from './stampFieldTemplates';
import type { ExportFileResult } from './exportProject';
import type { Stamp } from '../types/stamp';
import type { FieldLabels } from './fieldLabels';

const THUMB_WIDTH = 120;
const THUMB_HEIGHT = 90;
const THUMB_COL = 1;

const DEFAULT_LABEL_SET = new Set([
  DEFAULT_FIELD_TITLE_LABEL,
  DEFAULT_FIELD_PLACE_LABEL,
  DEFAULT_FIELD_MEMO_LABEL,
  DEFAULT_FIELD_EXTRA1_LABEL,
  DEFAULT_FIELD_EXTRA2_LABEL,
  DEFAULT_FIELD_EXTRA3_LABEL,
]);

function labelLooksCustom(raw: string | null | undefined): boolean {
  const s = (raw || '').trim();
  return Boolean(s) && !DEFAULT_LABEL_SET.has(s);
}

function stampHasCustomFieldLabels(stamp: Stamp): boolean {
  return (
    labelLooksCustom(stamp.titleFieldLabel) ||
    labelLooksCustom(stamp.placeFieldLabel) ||
    labelLooksCustom(stamp.memoFieldLabel) ||
    labelLooksCustom(stamp.extra1FieldLabel) ||
    labelLooksCustom(stamp.extra2FieldLabel) ||
    labelLooksCustom(stamp.extra3FieldLabel)
  );
}

async function pickHeaderLabels(stamps: Stamp[]): Promise<FieldLabels> {
  const customStamp = stamps.find(stampHasCustomFieldLabels);
  if (customStamp) {
    return resolveFieldLabels({
      titleFieldLabel: customStamp.titleFieldLabel ?? undefined,
      placeFieldLabel: customStamp.placeFieldLabel ?? undefined,
      memoFieldLabel: customStamp.memoFieldLabel ?? undefined,
      extra1FieldLabel: customStamp.extra1FieldLabel ?? undefined,
      extra2FieldLabel: customStamp.extra2FieldLabel ?? undefined,
      extra3FieldLabel: customStamp.extra3FieldLabel ?? undefined,
    });
  }

  for (const stamp of stamps) {
    const tid = stamp.templateId?.trim();
    if (!tid) continue;
    const tmpl = await findStampFieldTemplate(tid);
    if (tmpl) {
      return resolveFieldLabels(tmpl.labels);
    }
  }

  const first = stamps[0];
  return resolveFieldLabels({
    titleFieldLabel: first?.titleFieldLabel ?? undefined,
    placeFieldLabel: first?.placeFieldLabel ?? undefined,
    memoFieldLabel: first?.memoFieldLabel ?? undefined,
    extra1FieldLabel: first?.extra1FieldLabel ?? undefined,
    extra2FieldLabel: first?.extra2FieldLabel ?? undefined,
    extra3FieldLabel: first?.extra3FieldLabel ?? undefined,
  });
}

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

function bufferToUint8Array(buffer: ExcelJS.Buffer): Uint8Array {
  if (buffer instanceof ArrayBuffer) {
    return new Uint8Array(buffer);
  }
  if (buffer instanceof Uint8Array) {
    return buffer;
  }
  // Node Buffer-like
  return new Uint8Array(buffer as ArrayBuffer);
}

function downloadBlobOnWeb(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function readImageBase64(imagePath: string): Promise<{ base64: string; extension: 'jpeg' | 'png' }> {
  const uri = resolveImageUri(imagePath);
  const extension = imagePath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return { base64: arrayBufferToBase64(arrayBuffer), extension };
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { base64, extension };
}

function formatFloor(floor: string | null | undefined): string {
  if (!floor) {
    return '';
  }
  return `${floor}층`;
}

export async function createStampsXlsx(stamps: Stamp[], fileName: string): Promise<ExportFileResult> {
  if (stamps.length === 0) {
    throw new Error('보낼 스탬프가 없습니다.');
  }

  const safeName = sanitizeExportBaseName(fileName);
  const coordsLabel = await getCoordsLabelMode();
  const headers = await pickHeaderLabels(stamps);
  const templateNames = await listStampFieldTemplatesForFilter();
  const templateNameById = new Map(templateNames.map((t) => [t.id, t.name]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'VoiceStamp';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('스탬프', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // fixed_plus: photographer + preview/index/floor/coords/datetime + template fields + type
  sheet.columns = [
    { header: '촬영자', key: 'uploader', width: 14 },
    { header: '미리보기', key: 'preview', width: 18 },
    { header: '순번', key: 'index', width: 8 },
    { header: headers.titleFieldLabel, key: 'title', width: 28 },
    { header: headers.placeFieldLabel, key: 'place', width: 24 },
    { header: headers.memoFieldLabel, key: 'memo', width: 36 },
    { header: headers.extra1FieldLabel, key: 'extra1', width: 18 },
    { header: headers.extra2FieldLabel, key: 'extra2', width: 18 },
    { header: headers.extra3FieldLabel, key: 'extra3', width: 18 },
    { header: '층', key: 'floor', width: 10 },
    { header: '좌표', key: 'coords', width: 24 },
    { header: '촬영일시', key: 'createdAt', width: 22 },
    { header: '저장 유형', key: 'template', width: 18 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  for (let i = 0; i < stamps.length; i++) {
    const stamp = stamps[i];
    const rowIndex = i + 2;
    const coords = stampCoordinatesLine(stamp, coordsLabel) ?? '';
    const typeId = stamp.templateId?.trim() || '';
    const typeName = typeId
      ? templateNameById.get(typeId) || typeId
      : '';

    sheet.getRow(rowIndex).height = 72;
    sheet.getCell(rowIndex, 1).value = stamp.uploadedByMark?.trim() ?? '';
    sheet.getCell(rowIndex, 3).value = i + 1;
    sheet.getCell(rowIndex, 4).value = stamp.title;
    sheet.getCell(rowIndex, 5).value = stamp.placeLabel?.trim() ?? '';
    sheet.getCell(rowIndex, 6).value = stamp.memo;
    sheet.getCell(rowIndex, 7).value = stamp.extra1?.trim() ?? '';
    sheet.getCell(rowIndex, 8).value = stamp.extra2?.trim() ?? '';
    sheet.getCell(rowIndex, 9).value = stamp.extra3?.trim() ?? '';
    sheet.getCell(rowIndex, 10).value = formatFloor(stamp.floor);
    sheet.getCell(rowIndex, 11).value = coords;
    sheet.getCell(rowIndex, 12).value = new Date(stamp.createdAt).toLocaleString('ko-KR');
    sheet.getCell(rowIndex, 13).value = typeName;

    try {
      const { base64, extension } = await readImageBase64(stamp.imagePath);
      const imageId = workbook.addImage({
        base64,
        extension,
      });
      sheet.addImage(imageId, {
        tl: { col: THUMB_COL, row: rowIndex - 1 },
        ext: { width: THUMB_WIDTH, height: THUMB_HEIGHT },
      });
    } catch {
      sheet.getCell(rowIndex, 2).value = '(이미지 없음)';
    }
  }

  const xlsxFileName = `${safeName}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();

  if (Platform.OS === 'web') {
    const bytesForBlob = bufferToUint8Array(buffer);
    const blob = new Blob([bytesForBlob], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const webBlobUrl = URL.createObjectURL(blob);
    return { uri: 'web', fileName: xlsxFileName, webBlobUrl };
  }

  const xlsxPath = writeUint8ArrayToCacheFile(bufferToUint8Array(buffer), xlsxFileName);
  return { uri: xlsxPath, fileName: xlsxFileName };
}

export async function shareStampsXlsx(result: ExportFileResult): Promise<void> {
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
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: '엑셀 파일 공유',
  });
}
