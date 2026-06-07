import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { readImageDataUriForPdf } from './pdfImageForExport';
import { pdfDisplayTitle } from './pdfTitleFormat';
import {
  getMemoTextAlign,
  getPdfImageQuality,
  getPdfPhotosPerPage,
  getPdfShowDatetime,
  getTitleTextAlign,
  type PdfPhotosPerPage,
  type TextAlign,
} from './settingsService';
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

function imageMaxHeight(photosPerPage: PdfPhotosPerPage): string {
  switch (photosPerPage) {
    case 1:
      return '80vh';
    case 2:
      return '45vh';
    case 3:
      return '34vh';
    default:
      return '30vh';
  }
}

function imageMarginStyle(align: TextAlign): string {
  switch (align) {
    case 'left':
      return 'margin-left: 0; margin-right: auto;';
    case 'right':
      return 'margin-left: auto; margin-right: 0;';
    default:
      return 'margin-left: auto; margin-right: auto;';
  }
}

function buildStampItem(
  stamp: Stamp,
  imageDataUri: string,
  photosPerPage: PdfPhotosPerPage,
  titleAlign: TextAlign,
  memoAlign: TextAlign,
  showDatetime: boolean,
): string {
  const title = escapeHtml(pdfDisplayTitle(stamp.title, showDatetime));
  const memoTrimmed = stamp.memo?.trim() ?? '';
  const memoBlock = memoTrimmed
    ? `<p class="memo" style="text-align: ${memoAlign};">${escapeHtml(memoTrimmed)}</p>`
    : '';
  const date = escapeHtml(new Date(stamp.createdAt).toLocaleString('ko-KR'));
  const dateBlock = showDatetime
    ? `<p class="date" style="text-align: ${titleAlign};">${date}</p>`
    : '';
  const maxHeight = imageMaxHeight(photosPerPage);

  const imageMargin = imageMarginStyle(titleAlign);

  return `
      <div class="item">
        <img src="${imageDataUri}" alt="stamp" style="width: 100%; max-height: ${maxHeight}; ${imageMargin}" />
        <h1 style="text-align: ${titleAlign};">${title}</h1>
        ${memoBlock}
        ${dateBlock}
      </div>`;
}

function chunkStamps<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function buildHtml(
  stamps: Stamp[],
  imageDataUris: string[],
  documentTitle: string,
  photosPerPage: PdfPhotosPerPage,
  titleAlign: TextAlign,
  memoAlign: TextAlign,
  showDatetime: boolean,
): string {
  const stampPages = chunkStamps(
    stamps.map((stamp, index) => ({ stamp, imageDataUri: imageDataUris[index] })),
    photosPerPage,
  );

  const pages = stampPages
    .map((group) => {
      const items = group
        .map(({ stamp, imageDataUri }) =>
          buildStampItem(stamp, imageDataUri, photosPerPage, titleAlign, memoAlign, showDatetime),
        )
        .join('');
      return `
      <div class="page">
        <div class="grid grid-${photosPerPage}">
          ${items}
        </div>
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
  .page { page-break-after: always; padding: 12px; }
  .page:last-child { page-break-after: auto; }
  .grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  .item { box-sizing: border-box; padding: 4px; }
  .grid-1 .item { width: 100%; }
  .grid-2 .item { width: calc(50% - 6px); }
  .grid-3 .item { width: calc(33.333% - 8px); }
  .grid-4 .item { width: calc(50% - 6px); }
  img { display: block; max-width: 100%; object-fit: contain; }
  h1 { font-size: 16px; margin: 8px 0 4px; }
  .memo { font-size: 13px; color: #444; white-space: pre-wrap; margin: 0; }
  .date { font-size: 11px; color: #888; margin-top: 6px; }
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
      throw new Error('?몄뇙 ?꾨젅?꾩쓣 ?????놁뒿?덈떎.');
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
    throw new Error('PDF媛 以鍮꾨릺吏 ?딆븯?듬땲??');
  }

  const safeName = sanitizePdfFileName(fileName);
  await printHtmlInIframe(lastWebPrintHtml, safeName);
}

async function safeCopyAsync(from: string, to: string): Promise<void> {
  if (from === to) {
    return;
  }

  const destInfo = await FileSystem.getInfoAsync(to);
  if (destInfo.exists) {
    await FileSystem.deleteAsync(to, { idempotent: true });
  }

  await FileSystem.copyAsync({ from, to });
}

async function namePdfFile(uri: string, fileName: string): Promise<string> {
  const safeName = sanitizePdfFileName(fileName);
  const base = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!base) {
    return uri;
  }

  const dest = `${base}${safeName}.pdf`;
  await safeCopyAsync(uri, dest);
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
  await safeCopyAsync(uri, dest);
}

export async function createStampsPdf(stamps: Stamp[], fileName: string): Promise<string> {
  if (stamps.length === 0) {
    throw new Error('蹂대궪 ?ㅽ꺃?꾧? ?놁뒿?덈떎.');
  }

  const safeName = sanitizePdfFileName(fileName);
  const [photosPerPage, imageQuality, titleAlign, memoAlign, showDatetime] = await Promise.all([
    getPdfPhotosPerPage(),
    getPdfImageQuality(),
    getTitleTextAlign(),
    getMemoTextAlign(),
    getPdfShowDatetime(),
  ]);
  const imageDataUris = await Promise.all(
    stamps.map((stamp) => readImageDataUriForPdf(stamp.imagePath, imageQuality)),
  );

  const html = buildHtml(stamps, imageDataUris, safeName, photosPerPage, titleAlign, memoAlign, showDatetime);

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
    throw new Error('???湲곕뒫???ъ슜?????놁뒿?덈떎.');
  }

  const shareUri = await namePdfFile(uri, fileName);

  await Sharing.shareAsync(shareUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'PDF ???,
  });
}

export async function sharePdf(uri: string, fileName: string): Promise<void> {
  if (Platform.OS === 'web') {
    await printWebPdf(fileName);
    return;
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('怨듭쑀 湲곕뒫???ъ슜?????놁뒿?덈떎.');
  }

  const shareUri = await namePdfFile(uri, fileName);

  await Sharing.shareAsync(shareUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'PDF 怨듭쑀',
  });
}
