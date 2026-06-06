import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { resolveImageUri } from './fileService';
import type { Stamp } from '../types/stamp';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function readImageAsDataUri(imagePath: string): Promise<string> {
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  const uri = resolveImageUri(imagePath);
  const ext = imagePath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/${ext};base64,${base64}`;
}

function buildHtml(stamps: Stamp[], imageDataUris: string[]): string {
  const pages = stamps
    .map((stamp, i) => {
      const title = escapeHtml(stamp.title || '(제목 없음)');
      const memo = escapeHtml(stamp.memo || '(메모 없음)');
      const date = escapeHtml(new Date(stamp.createdAt).toLocaleString('ko-KR'));
      return `
      <div class="page">
        <img src="${imageDataUris[i]}" alt="stamp" />
        <h1>${title}</h1>
        <p class="memo">${memo}</p>
        <p class="date">${date}</p>
      </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: sans-serif; margin: 0; padding: 0; }
  .page { page-break-after: always; padding: 24px; text-align: center; }
  .page:last-child { page-break-after: auto; }
  img { max-width: 100%; max-height: 60vh; object-fit: contain; }
  h1 { font-size: 20px; margin: 16px 0 8px; }
  .memo { font-size: 14px; color: #444; white-space: pre-wrap; }
  .date { font-size: 12px; color: #888; margin-top: 12px; }
</style>
</head>
<body>${pages}</body>
</html>`;
}

async function archivePdf(uri: string): Promise<string> {
  if (!FileSystem.documentDirectory) {
    return uri;
  }

  const dir = `${FileSystem.documentDirectory}exports/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const filename = `VoiceStamp_${Date.now()}.pdf`;
  const dest = `${dir}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function createStampsPdf(stamps: Stamp[]): Promise<string> {
  if (stamps.length === 0) {
    throw new Error('보낼 스탬프가 없습니다.');
  }

  const imageDataUris = await Promise.all(
    stamps.map((stamp) => readImageAsDataUri(stamp.imagePath)),
  );

  const html = buildHtml(stamps, imageDataUris);
  const { uri } = await Print.printToFileAsync({ html });
  await archivePdf(uri);
  return uri;
}

export async function savePdf(uri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('저장 기능을 사용할 수 없습니다.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'PDF 저장',
  });
}

export async function sharePdf(uri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('공유 기능을 사용할 수 없습니다.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'PDF 공유',
  });
}
