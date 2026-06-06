import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { resolveImageUri } from './fileService';
import type { Stamp } from '../types/stamp';

const WEB_PDF_URI = 'web:print-ready';

let lastWebPrintHtml: string | null = null;

function sanitizePdfFileName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ');
  return cleaned || 'VoiceStamp';
}

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

function buildHtml(stamps: Stamp[], imageDataUris: string[], documentTitle: string): string {
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
<title>${escapeHtml(documentTitle)}</title>
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

async function waitForImages(doc: Document): Promise<void> {
  const images = Array.from(doc.images);
  if (images.length === 0) {
    return;
  }

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

async function printHtmlInIframe(html: string, documentTitle: string): Promise<void> {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) {
      throw new Error('인쇄 프레임을 열 수 없습니다.');
    }

    doc.open();
    doc.write(html);
    doc.close();
    doc.title = documentTitle;

    await waitForImages(doc);

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  } finally {
    setTimeout(() => {
      iframe.remove();
    }, 1000);
  }
}

async function printWebPdf(fileName: string): Promise<void> {
  if (!lastWebPrintHtml) {
    throw new Error('PDF가 준비되지 않았습니다.');
  }

  const safeName = sanitizePdfFileName(fileName);
  await printHtmlInIframe(lastWebPrintHtml, safeName);
}

async function namePdfFile(uri: string, fileName: string): Promise<string> {
  const safeName = sanitizePdfFileName(fileName);
  const base = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!base) {
    return uri;
  }

  const dest = `${base}${safeName}.pdf`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

async function archivePdf(uri: string, fileName: string): Promise<void> {
  if (!FileSystem.documentDirectory) {
    return;
  }

  const dir = `${FileSystem.documentDirectory}exports/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const dest = `${dir}${sanitizePdfFileName(fileName)}.pdf`;
  await FileSystem.copyAsync({ from: uri, to: dest });
}

export async function createStampsPdf(stamps: Stamp[], fileName: string): Promise<string> {
  if (stamps.length === 0) {
    throw new Error('보낼 스탬프가 없습니다.');
  }

  const safeName = sanitizePdfFileName(fileName);
  const imageDataUris = await Promise.all(
    stamps.map((stamp) => readImageAsDataUri(stamp.imagePath)),
  );

  const html = buildHtml(stamps, imageDataUris, safeName);

  if (Platform.OS === 'web') {
    lastWebPrintHtml = html;
    return WEB_PDF_URI;
  }

  const { uri } = await Print.printToFileAsync({ html });
  const namedUri = await namePdfFile(uri, safeName);
  await archivePdf(namedUri, safeName);
  return namedUri;
}

export async function savePdf(uri: string, fileName: string): Promise<void> {
  if (Platform.OS === 'web') {
    await printWebPdf(fileName);
    return;
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('저장 기능을 사용할 수 없습니다.');
  }

  const shareUri = await namePdfFile(uri, fileName);

  await Sharing.shareAsync(shareUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'PDF 저장',
  });
}

export async function sharePdf(uri: string, fileName: string): Promise<void> {
  if (Platform.OS === 'web') {
    await printWebPdf(fileName);
    return;
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('공유 기능을 사용할 수 없습니다.');
  }

  const shareUri = await namePdfFile(uri, fileName);

  await Sharing.shareAsync(shareUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'PDF 공유',
  });
}
