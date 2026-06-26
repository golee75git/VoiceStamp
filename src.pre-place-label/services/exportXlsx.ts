import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { resolveImageUri } from './fileService';
import { stampCoordinatesLine } from './stampCoords';
import { getCoordsLabelMode } from './settingsService';
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
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'VoiceStamp';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('스탬프', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: '미리보기', key: 'preview', width: 18 },
    { header: '순번', key: 'index', width: 8 },
    { header: '제목', key: 'title', width: 28 },
    { header: '메모', key: 'memo', width: 36 },
    { header: '층', key: 'floor', width: 10 },
    { header: '좌표', key: 'coords', width: 24 },
    { header: '촬영일시', key: 'createdAt', width: 22 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  for (let i = 0; i < stamps.length; i++) {
    const stamp = stamps[i];
    const rowIndex = i + 2;
    const coords = stampCoordinatesLine(stamp, coordsLabel) ?? '';

    sheet.getRow(rowIndex).height = 72;
    sheet.getCell(rowIndex, 2).value = i + 1;
    sheet.getCell(rowIndex, 3).value = stamp.title;
    sheet.getCell(rowIndex, 4).value = stamp.memo;
    sheet.getCell(rowIndex, 5).value = formatFloor(stamp.floor);
    sheet.getCell(rowIndex, 6).value = coords;
    sheet.getCell(rowIndex, 7).value = new Date(stamp.createdAt).toLocaleString('ko-KR');

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
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const webBlobUrl = URL.createObjectURL(blob);
    return { uri: 'web', fileName: xlsxFileName, webBlobUrl };
  }

  const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!dir) {
    throw new Error('저장 경로를 사용할 수 없습니다.');
  }

  const xlsxPath = `${dir}${xlsxFileName}`;
  await FileSystem.writeAsStringAsync(xlsxPath, arrayBufferToBase64(buffer), {
    encoding: FileSystem.EncodingType.Base64,
  });

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
