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
import { listStampFieldTemplatesForFilter } from './stampFieldTemplates';
import type { ExportFileResult } from './exportProject';
import type { Stamp } from '../types/stamp';

const THUMB_WIDTH = 120;
const THUMB_HEIGHT = 90;
const THUMB_COL = 0;

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

function pickHeaderLabels(stamps: Stamp[]) {
  const withLabels = stamps.find(
    (s) =>
      (s.titleFieldLabel && s.titleFieldLabel.trim()) ||
      (s.placeFieldLabel && s.placeFieldLabel.trim()) ||
      (s.memoFieldLabel && s.memoFieldLabel.trim()) ||
      (s.extra1FieldLabel && s.extra1FieldLabel.trim()),
  );
  return resolveFieldLabels(
    withLabels
      ? {
          titleFieldLabel: withLabels.titleFieldLabel ?? undefined,
          placeFieldLabel: withLabels.placeFieldLabel ?? undefined,
          memoFieldLabel: withLabels.memoFieldLabel ?? undefined,
          extra1FieldLabel: withLabels.extra1FieldLabel ?? undefined,
          extra2FieldLabel: withLabels.extra2FieldLabel ?? undefined,
          extra3FieldLabel: withLabels.extra3FieldLabel ?? undefined,
        }
      : {
          titleFieldLabel: DEFAULT_FIELD_TITLE_LABEL,
          placeFieldLabel: DEFAULT_FIELD_PLACE_LABEL,
          memoFieldLabel: DEFAULT_FIELD_MEMO_LABEL,
          extra1FieldLabel: DEFAULT_FIELD_EXTRA1_LABEL,
          extra2FieldLabel: DEFAULT_FIELD_EXTRA2_LABEL,
          extra3FieldLabel: DEFAULT_FIELD_EXTRA3_LABEL,
        },
  );
}

export async function createStampsXlsx(stamps: Stamp[], fileName: string): Promise<ExportFileResult> {
  if (stamps.length === 0) {
    throw new Error('보낼 스탬프가 없습니다.');
  }

  const safeName = sanitizeExportBaseName(fileName);
  const coordsLabel = await getCoordsLabelMode();
  const headers = pickHeaderLabels(stamps);
  const templateNames = await listStampFieldTemplatesForFilter();
  const templateNameById = new Map(templateNames.map((t) => [t.id, t.name]));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'VoiceStamp';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('스탬프', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // fixed_plus: keep preview/index/floor/coords/datetime + all template field columns + type
  sheet.columns = [
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
    sheet.getCell(rowIndex, 2).value = i + 1;
    sheet.getCell(rowIndex, 3).value = stamp.title;
    sheet.getCell(rowIndex, 4).value = stamp.placeLabel?.trim() ?? '';
    sheet.getCell(rowIndex, 5).value = stamp.memo;
    sheet.getCell(rowIndex, 6).value = stamp.extra1?.trim() ?? '';
    sheet.getCell(rowIndex, 7).value = stamp.extra2?.trim() ?? '';
    sheet.getCell(rowIndex, 8).value = stamp.extra3?.trim() ?? '';
    sheet.getCell(rowIndex, 9).value = formatFloor(stamp.floor);
    sheet.getCell(rowIndex, 10).value = coords;
    sheet.getCell(rowIndex, 11).value = new Date(stamp.createdAt).toLocaleString('ko-KR');
    sheet.getCell(rowIndex, 12).value = typeName;

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
      sheet.getCell(rowIndex, 1).value = '(이미지 없음)';
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
