import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { readImageDataUriForPdf } from './pdfImageForExport';
import { stampDisplayTitle } from './stampFloor';
import { stampCoordinatesLine } from './stampCoords';
import { stampPlaceLine } from './stampPlace';
import {
  ensureStampGroupDir,
  extractStampGroupFromImagePath,
} from './fileService';
import {
  getMemoFieldLabel,
  getMemoTextAlign,
  getExtra1FieldLabel,
  getExtra2FieldLabel,
  getOverlayFooterPhrase,
  getOverlayOrgName,
  getOverlayShowFooterPhrase,
  getOverlayShowOrgName,
  getPdfImageQuality,
  getPdfPhotosPerPage,
  getPdfShowDatetime,
  getPlaceFieldLabel,
  getStampTextLayout,
  getWatermarkStyle,
  getCoordsLabelMode,
  getTitleFieldLabel,
  getTitleTextAlign,
  type PdfPhotosPerPage,
  type StampTextLayout,
  type CoordsLabelMode,
  type TextAlign,
  type WatermarkStyle,
} from './settingsService';
import {
  overlayPhraseFontSize,
  resolveOverlayFooterPhrase,
  resolveOverlayOrgName,
  type OverlayTextFields,
} from './overlayText';
import {
  fieldLabelsFromStamp,
  formatLabeledValue,
  resolveFieldLabels,
  type FieldLabels,
} from './fieldLabels';
import { buildCaptionTableRows } from './captionTable';
import { watermarkBarCss, getWatermarkTheme } from './watermarkStyle';
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

function photoSlotHeight(photosPerPage: PdfPhotosPerPage, shrinkForReportHeader: boolean): string {
  switch (photosPerPage) {
    case 1:
      return shrinkForReportHeader ? '72vh' : '80vh';
    case 2:
      return shrinkForReportHeader ? '40vh' : '45vh';
    case 3:
      return shrinkForReportHeader ? '30vh' : '34vh';
    default:
      return shrinkForReportHeader ? '26vh' : '30vh';
  }
}

function buildStampItem(
  stamp: Stamp,
  imageDataUri: string,
  photosPerPage: PdfPhotosPerPage,
  titleAlign: TextAlign,
  memoAlign: TextAlign,
  showDatetime: boolean,
  shrinkForReportHeader: boolean,
  textLayout: StampTextLayout,
  coordsLabel: CoordsLabelMode,
  watermarkStyle: WatermarkStyle,
  overlay: OverlayTextFields,
  fieldLabels: FieldLabels,
): string {
  const labels = resolveFieldLabels(fieldLabels);
  const titleRaw = stampDisplayTitle(stamp, showDatetime);
  const title = escapeHtml(formatLabeledValue(labels.titleFieldLabel, titleRaw));
  const memoTrimmed = stamp.memo?.trim() ?? '';
  const memoLabeled = formatLabeledValue(labels.memoFieldLabel, memoTrimmed);
  const placeRaw = stampPlaceLine(stamp);
  const placeLabeled = placeRaw
    ? formatLabeledValue(labels.placeFieldLabel, placeRaw)
    : '';
  const place = placeLabeled;
  const extra1Labeled = formatLabeledValue(labels.extra1FieldLabel, stamp.extra1?.trim() ?? '');
  const extra2Labeled = formatLabeledValue(labels.extra2FieldLabel, stamp.extra2?.trim() ?? '');
  const coords = stampCoordinatesLine(stamp, coordsLabel);
  const orgName = resolveOverlayOrgName(overlay);
  const footerPhrase = resolveOverlayFooterPhrase(overlay);
  const phraseSize = overlayPhraseFontSize(11);
  const coordsBlock = coords
    ? `<div class="stamp-coords" style="text-align: ${memoAlign};">${escapeHtml(coords)}</div>`
    : '';
  const slotHeight = photoSlotHeight(photosPerPage, shrinkForReportHeader);
  const photoSlot = `<div class="photo-slot" style="height: ${slotHeight};"><img src="${imageDataUri}" alt="stamp" /></div>`;

  if (textLayout === 'watermark') {
    const theme = getWatermarkTheme(watermarkStyle);
    const memoBlock = memoLabeled
      ? `<div class="watermark-memo" style="text-align: ${memoAlign}; color: ${theme.memoColor};">${escapeHtml(memoLabeled)}</div>`
      : '';
    const watermarkPlaceBlock = place
      ? `<div class="watermark-place" style="text-align: ${titleAlign}; color: ${theme.memoColor};">${escapeHtml(place)}</div>`
      : '';
    const watermarkExtra1Block = extra1Labeled
      ? `<div class="watermark-place" style="text-align: ${titleAlign}; color: ${theme.memoColor};">${escapeHtml(extra1Labeled)}</div>`
      : '';
    const watermarkExtra2Block = extra2Labeled
      ? `<div class="watermark-place" style="text-align: ${titleAlign}; color: ${theme.memoColor};">${escapeHtml(extra2Labeled)}</div>`
      : '';
    const watermarkCoordsBlock = coords
      ? `<div class="stamp-coords" style="text-align: ${memoAlign}; color: ${theme.coordsColor};">${escapeHtml(coords)}</div>`
      : '';
    const orgBlock = orgName
      ? `<div class="watermark-org" style="text-align: ${titleAlign}; color: ${theme.titleColor};">${escapeHtml(orgName)}</div>`
      : '';
    const phraseBlock = footerPhrase
      ? `<div class="watermark-phrase" style="text-align: ${memoAlign}; color: ${theme.coordsColor}; font-size: ${phraseSize}px;">${escapeHtml(footerPhrase)}</div>`
      : '';
    const titleBlock = title
      ? `<div class="watermark-title" style="text-align: ${titleAlign}; color: ${theme.titleColor};">${title}</div>`
      : '';
    return `
      <div class="item item-watermark">
        <div class="photo-slot photo-slot-watermark" style="height: ${slotHeight};">
          <img src="${imageDataUri}" alt="stamp" />
          <div class="watermark-bar" style="${watermarkBarCss(watermarkStyle)}">
            ${orgBlock}
            ${titleBlock}
            ${watermarkPlaceBlock}
            ${watermarkExtra1Block}
            ${watermarkExtra2Block}
            ${memoBlock}
            ${watermarkCoordsBlock}
            ${phraseBlock}
          </div>
        </div>
      </div>`;
  }

  const orgBlock = orgName
    ? `<p class="caption-org" style="text-align: ${titleAlign};">${escapeHtml(orgName)}</p>`
    : '';
  const tableRows = buildCaptionTableRows(stamp, labels, {
    showDatetime,
    coordsLabel,
    includeCoords: true,
  });
  const tableBody = tableRows
    .map(
      (row) =>
        `<tr><th scope="row">${escapeHtml(row.label)}</th><td style="text-align: ${memoAlign};">${escapeHtml(row.value)}</td></tr>`,
    )
    .join('');
  const tableBlock = tableRows.length
    ? `<table class="caption-table"><tbody>${tableBody}</tbody></table>`
    : '';
  const phraseBlock = footerPhrase
    ? `<p class="caption-phrase" style="text-align: ${memoAlign}; font-size: ${phraseSize}px;">${escapeHtml(footerPhrase)}</p>`
    : '';
  const date = escapeHtml(new Date(stamp.createdAt).toLocaleString('ko-KR'));
  const dateBlock = showDatetime
    ? `<p class="date" style="text-align: ${titleAlign};">${date}</p>`
    : '';

  return `
      <div class="item item-caption">
        <figure class="stamp-figure">
          ${photoSlot}
          <figcaption class="stamp-caption">
            ${orgBlock}
            ${tableBlock}
            ${phraseBlock}
            ${dateBlock}
          </figcaption>
        </figure>
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
  reportTitle: string,
  textLayout: StampTextLayout,
  coordsLabel: CoordsLabelMode,
  watermarkStyle: WatermarkStyle,
  overlay: OverlayTextFields,
  fieldLabels: FieldLabels,
): string {
  const reportTitleTrimmed = reportTitle.trim();
  const stampPages = chunkStamps(
    stamps.map((stamp, index) => ({ stamp, imageDataUri: imageDataUris[index] })),
    photosPerPage,
  );

  const pages = stampPages
    .map((group, pageIndex) => {
      const shrinkImages = pageIndex === 0 && reportTitleTrimmed.length > 0;
      const items = group
        .map(({ stamp, imageDataUri }) =>
          buildStampItem(
            stamp,
            imageDataUri,
            photosPerPage,
            titleAlign,
            memoAlign,
            showDatetime,
            shrinkImages,
            textLayout,
            coordsLabel,
            watermarkStyle,
            overlay,
            {
              ...fieldLabels,
              ...fieldLabelsFromStamp(stamp),
            },
          ),
        )
        .join('');
      const reportHeader =
        pageIndex === 0 && reportTitleTrimmed
          ? `<h1 class="report-title" style="text-align: ${titleAlign};">${escapeHtml(reportTitleTrimmed)}</h1>`
          : '';
      return `
      <div class="page">
        ${reportHeader}
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
  .photo-slot {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    overflow: hidden;
    box-sizing: border-box;
  }
  .photo-slot > img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }
  .item-caption .stamp-figure {
    width: 100%;
    margin: 0;
    text-align: left;
  }
  .item-caption .stamp-caption { display: block; }
  h1.report-title { font-size: 20px; font-weight: 700; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #ddd; }
  .item h1, .item-caption h1 { font-size: 16px; margin: 8px 0 4px; }
  .caption-table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 4px;
    font-size: 12px;
    table-layout: fixed;
  }
  .caption-table th, .caption-table td {
    border: 1px solid #d1d5db;
    padding: 5px 8px;
    vertical-align: top;
    word-break: break-word;
  }
  .caption-table th {
    width: 28%;
    background: #f3f4f6;
    color: #111827;
    font-weight: 700;
    text-align: left;
  }
  .caption-table td { color: #374151; white-space: pre-wrap; }
  .memo { font-size: 13px; color: #444; white-space: pre-wrap; margin: 0; }
  .date { font-size: 11px; color: #888; margin-top: 6px; }
  .photo-slot-watermark .watermark-bar {
    position: absolute; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.55); padding: 8px 10px; color: #fff;
  }
  .watermark-bar-top { top: 0; bottom: auto; }
  .watermark-org { font-size: 12px; font-weight: 700; }
  .watermark-phrase { margin-top: 4px; opacity: 0.9; }
  .caption-org { font-size: 13px; font-weight: 700; margin: 8px 0 4px; color: #111827; }
  .caption-phrase { font-size: 11px; color: #6b7280; margin: 4px 0 0; }
  .watermark-title { font-size: 14px; font-weight: 700; }
  .watermark-memo { font-size: 12px; white-space: pre-wrap; margin-top: 4px; opacity: 0.95; }
  .watermark-place { font-size: 12px; white-space: pre-wrap; margin-top: 4px; opacity: 0.95; }
  .place { font-size: 13px; color: #444; white-space: pre-wrap; margin: 0; }
  .stamp-coords { font-size: 11px; white-space: pre-wrap; margin-top: 4px; color: #6b7280; }
  .item-watermark .stamp-coords { color: #e5e7eb; opacity: 0.95; }
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

/** Pick the most common stamp folder (YYYYMMDD_장소). Ties keep first-seen order. */
function resolveArchiveGroupFromStamps(stamps: Stamp[]): string | null {
  const counts = new Map<string, number>();
  let best: string | null = null;
  let bestCount = 0;

  for (const stamp of stamps) {
    const group = extractStampGroupFromImagePath(stamp.imagePath)?.trim();
    if (!group) {
      continue;
    }
    const next = (counts.get(group) ?? 0) + 1;
    counts.set(group, next);
    if (next > bestCount) {
      best = group;
      bestCount = next;
    }
  }

  return best;
}

async function archivePdf(uri: string, fileName: string, groupName?: string | null): Promise<void> {
  if (!FileSystem.documentDirectory) {
    return;
  }

  let dir: string;
  const trimmedGroup = groupName?.trim();
  if (trimmedGroup) {
    try {
      dir = await ensureStampGroupDir(trimmedGroup);
    } catch {
      dir = `${FileSystem.documentDirectory}exports/`;
    }
  } else {
    dir = `${FileSystem.documentDirectory}exports/`;
  }

  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const dest = `${dir}${sanitizePdfFileName(fileName)}.pdf`;
  await safeCopyAsync(uri, dest);
}

export async function createStampsPdf(
  stamps: Stamp[],
  fileName: string,
  reportTitle = '',
): Promise<string> {
  if (stamps.length === 0) {
    throw new Error('보낼 스탬프가 없습니다.');
  }

  const safeName = sanitizePdfFileName(fileName);
  const [photosPerPage, imageQuality, titleAlign, memoAlign, showDatetime, textLayout, coordsLabel, watermarkStyle, orgName, footerPhrase, showOrgName, showFooterPhrase, titleFieldLabel, placeFieldLabel, memoFieldLabel, extra1FieldLabel, extra2FieldLabel] = await Promise.all([
    getPdfPhotosPerPage(),
    getPdfImageQuality(),
    getTitleTextAlign(),
    getMemoTextAlign(),
    getPdfShowDatetime(),
    getStampTextLayout(),
    getCoordsLabelMode(),
    getWatermarkStyle(),
    getOverlayOrgName(),
    getOverlayFooterPhrase(),
    getOverlayShowOrgName(),
    getOverlayShowFooterPhrase(),
    getTitleFieldLabel(),
    getPlaceFieldLabel(),
    getMemoFieldLabel(),
    getExtra1FieldLabel(),
    getExtra2FieldLabel(),
  ]);
  const imageDataUris = await Promise.all(
    stamps.map((stamp) => readImageDataUriForPdf(stamp.imagePath, imageQuality)),
  );

  const html = buildHtml(
    stamps,
    imageDataUris,
    safeName,
    photosPerPage,
    titleAlign,
    memoAlign,
    showDatetime,
    reportTitle,
    textLayout,
    coordsLabel,
    watermarkStyle,
    { orgName, footerPhrase, showOrgName, showFooterPhrase },
    { titleFieldLabel, placeFieldLabel, memoFieldLabel, extra1FieldLabel, extra2FieldLabel },
  );

  if (Platform.OS === 'web') {
    lastWebPrintHtml = html;
    return WEB_PDF_URI;
  }

  const { uri } = await Print.printToFileAsync({ html });
  const namedUri = await namePdfFile(uri, safeName);
  await archivePdf(namedUri, safeName, resolveArchiveGroupFromStamps(stamps));
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
