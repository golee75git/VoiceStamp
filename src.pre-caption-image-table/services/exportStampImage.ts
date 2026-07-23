import { ImageManipulator, SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import {
  extractStampGroupFromImagePath,
  buildGalleryStampFileName,
  sanitizeStampFileBaseName,
  resolveImageUri,
} from './fileService';
import { embedCaptionExif } from './embedCaptionExif';
import { saveStampPhotoToGallery } from './galleryService';
import { renderStampCaptionNative } from './renderStampCaptionNative';
import { renderStampWatermarkNative } from './renderStampWatermarkNative';
import { buildCaptionLayout } from './captionLayout';
import { stampDisplayTitle } from './stampFloor';
import { stampCoordinatesLine } from './stampCoords';
import { stampPlaceLine } from './stampPlace';
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
import type { StampTextLayout, TextAlign, CoordsLabelMode, WatermarkStyle, StampTextSize } from './settingsService';
import { DEFAULT_STAMP_TEXT_SIZE, stampTextSizeScale } from './settingsService';
import { drawWatermarkBar, getWatermarkTheme } from './watermarkStyle';
import type { Stamp } from '../types/stamp';

export const STAMP_JPEG_MAX_WIDTH = 2048;
export const STAMP_JPEG_COMPRESS = 0.85;
export const STAMP_PREVIEW_MAX_WIDTH = 720;
export const STAMP_PREVIEW_JPEG_COMPRESS = 0.72;

export function normalizeDisplayUri(uri: string): string {
  if (Platform.OS === 'web') {
    return uri;
  }
  if (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('http://') ||
    uri.startsWith('https://')
  ) {
    return uri;
  }
  if (uri.startsWith('/')) {
    return `file://${uri}`;
  }
  return uri;
}

async function copyToPreviewCache(sourceUri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return sourceUri;
  }

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    return normalizeDisplayUri(sourceUri);
  }

  const from = normalizeDisplayUri(sourceUri);
  const dest = `${cacheDir}preview-src-${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from, to: dest });
  return normalizeDisplayUri(dest);
}

async function resizePreviewThumb(inputUri: string): Promise<string> {
  const result = await manipulateAsync(
    inputUri,
    [{ resize: { width: STAMP_PREVIEW_MAX_WIDTH } }],
    { compress: STAMP_PREVIEW_JPEG_COMPRESS, format: SaveFormat.JPEG },
  );
  return normalizeDisplayUri(result.uri);
}

export type StampRenderParams = {
  sourceUri?: string;
  maxWidth?: number;
  jpegCompress?: number;
};

export type StampImageExportOptions = OverlayTextFields & FieldLabels & {
  titleAlign: TextAlign;
  memoAlign: TextAlign;
  showDatetime: boolean;
  textLayout: StampTextLayout;
  coordsLabel: CoordsLabelMode;
  watermarkStyle: WatermarkStyle;
  stampTextSize?: StampTextSize;
};

export type CaptureStampForExport = (
  stamp: Stamp,
  options: StampImageExportOptions,
) => Promise<string>;

export type PreparedExportPhoto = {
  uri: string;
  width: number;
  height: number;
};

export async function prepareExportPhoto(
  imageUri: string,
  maxWidth: number = STAMP_JPEG_MAX_WIDTH,
): Promise<PreparedExportPhoto> {
  const context = ImageManipulator.manipulate(imageUri);
  context.resize({ width: maxWidth });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: 1,
  });

  return {
    uri: saved.uri,
    width: image.width,
    height: image.height,
  };
}

export async function compressStampJpeg(sourceUri: string): Promise<string> {
  const result = await manipulateAsync(
    sourceUri,
    [{ resize: { width: STAMP_JPEG_MAX_WIDTH } }],
    { compress: STAMP_JPEG_COMPRESS, format: SaveFormat.JPEG },
  );
  return result.uri;
}

export async function prepareStampPreviewThumb(sourceUri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return resizePreviewThumb(sourceUri);
  }

  const cachedUri = await copyToPreviewCache(sourceUri);
  try {
    return await resizePreviewThumb(cachedUri);
  } catch {
    return cachedUri;
  }
}

function loadWebImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('???? ???? ?????.'));
    img.src = uri;
  });
}

function wrapCanvasLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    let current = '';
    for (const char of paragraph) {
      const next = current + char;
      if (ctx.measureText(next).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    }
    if (current) {
      lines.push(current);
    }
  }

  return lines.length > 0 ? lines : [''];
}

function drawAlignedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  align: TextAlign,
  fontSize: number,
  fontWeight: string,
  color: string,
  lineHeight: number,
): number {
  ctx.font = `${fontWeight} ${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  const lines = wrapCanvasLines(ctx, text, width);
  let cursorY = y;

  for (const line of lines) {
    let drawX = x;
    const lineWidth = ctx.measureText(line).width;
    if (align === 'center') {
      drawX = x + (width - lineWidth) / 2;
    } else if (align === 'right') {
      drawX = x + width - lineWidth;
    }
    ctx.fillText(line, drawX, cursorY);
    cursorY += lineHeight;
  }

  return cursorY;
}

async function renderStampJpegWatermarkOnWeb(
  stamp: Stamp,
  options: StampImageExportOptions,
): Promise<string> {
  const imageUri = resolveImageUri(stamp.imagePath);
  const img = await loadWebImage(imageUri);

  const scale = img.width > STAMP_JPEG_MAX_WIDTH ? STAMP_JPEG_MAX_WIDTH / img.width : 1;
  const imgWidth = Math.max(1, Math.round(img.width * scale));
  const imgHeight = Math.max(1, Math.round(img.height * scale));

  const labels = resolveFieldLabels(options);
  const title = formatLabeledValue(
    labels.titleFieldLabel,
    stampDisplayTitle(stamp, options.showDatetime),
  );
  const memo = formatLabeledValue(labels.memoFieldLabel, stamp.memo?.trim() ?? '');
  const place = formatLabeledValue(labels.placeFieldLabel, stampPlaceLine(stamp) ?? '');
  const extra1 = formatLabeledValue(labels.extra1FieldLabel, stamp.extra1?.trim() ?? '');
  const extra2 = formatLabeledValue(labels.extra2FieldLabel, stamp.extra2?.trim() ?? '');
  const extra3 = formatLabeledValue(labels.extra3FieldLabel, stamp.extra3?.trim() ?? '');
  const coords = stampCoordinatesLine(stamp, options.coordsLabel);
  const orgName = resolveOverlayOrgName(options) ?? '';
  const footerPhrase = resolveOverlayFooterPhrase(options) ?? '';
  const textScale = stampTextSizeScale(options.stampTextSize ?? DEFAULT_STAMP_TEXT_SIZE);
  const sz = (n: number) => Math.max(12, Math.round(n * textScale));
  const phraseSize = Math.max(12, Math.round(overlayPhraseFontSize(22) * textScale));
  const barPaddingX = 20;
  const barPaddingY = 16;
  const textWidth = imgWidth - barPaddingX * 2;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) {
    throw new Error('캔버스를 사용할 수 없습니다.');
  }

  measureCtx.font = `700 ${sz(26)}px sans-serif`;
  const orgLines = orgName ? wrapCanvasLines(measureCtx, orgName, textWidth) : [];

  measureCtx.font = `700 ${sz(32)}px sans-serif`;
  const titleLines = title ? wrapCanvasLines(measureCtx, title, textWidth) : [];
  measureCtx.font = `400 ${sz(24)}px sans-serif`;
  const placeLines = place ? wrapCanvasLines(measureCtx, place, textWidth) : [];
  const extra1Lines = extra1 ? wrapCanvasLines(measureCtx, extra1, textWidth) : [];
  const extra2Lines = extra2 ? wrapCanvasLines(measureCtx, extra2, textWidth) : [];
  const extra3Lines = extra3 ? wrapCanvasLines(measureCtx, extra3, textWidth) : [];
  measureCtx.font = `400 ${sz(26)}px sans-serif`;
  const memoLines = memo ? wrapCanvasLines(measureCtx, memo, textWidth) : [];
  measureCtx.font = `400 ${sz(22)}px sans-serif`;
  const coordsLines = coords ? wrapCanvasLines(measureCtx, coords, textWidth) : [];
  measureCtx.font = `400 ${phraseSize}px sans-serif`;
  const phraseLines = footerPhrase ? wrapCanvasLines(measureCtx, footerPhrase, textWidth) : [];

  const barHeight =
    barPaddingY +
    (orgLines.length > 0 ? orgLines.length * sz(30) + 4 : 0) +
    (titleLines.length > 0 ? titleLines.length * sz(38) : 0) +
    (placeLines.length > 0 ? 6 + placeLines.length * sz(28) : 0) +
    (extra1Lines.length > 0 ? 6 + extra1Lines.length * sz(28) : 0) +
    (extra2Lines.length > 0 ? 6 + extra2Lines.length * sz(28) : 0) +
    (extra3Lines.length > 0 ? 6 + extra3Lines.length * sz(28) : 0) +
    (memoLines.length > 0 ? 8 + memoLines.length * sz(32) : 0) +
    (coordsLines.length > 0 ? 6 + coordsLines.length * sz(28) : 0) +
    (phraseLines.length > 0 ? 4 + phraseLines.length * Math.max(18, Math.round(phraseSize * 1.1)) : 0) +
    barPaddingY;

  const canvas = document.createElement('canvas');
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('??? ????? ??? ? ????.');
  }

  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
  const theme = getWatermarkTheme(options.watermarkStyle);

  drawWatermarkBar(ctx, 0, imgHeight - barHeight, imgWidth, barHeight, options.watermarkStyle);

  let textY = imgHeight - barHeight + barPaddingY + (orgName ? sz(22) : sz(28));

  if (orgName) {
    textY =
      drawAlignedText(
        ctx,
        orgName,
        barPaddingX,
        textY,
        textWidth,
        options.titleAlign,
        sz(26),
        '700',
        theme.titleColor,
        sz(30),
      ) + 4;
  }

  textY =
    title
      ? drawAlignedText(
          ctx,
          title,
          barPaddingX,
          textY,
          textWidth,
          options.titleAlign,
          sz(32),
          '700',
          theme.titleColor,
          sz(38),
        ) + 4
      : textY;

  if (place) {
    textY = drawAlignedText(
      ctx,
      place,
      barPaddingX,
      textY + 2,
      textWidth,
      options.titleAlign,
      sz(24),
      '400',
      theme.memoColor,
      sz(28),
    );
  }

  if (extra1) {
    textY = drawAlignedText(
      ctx,
      extra1,
      barPaddingX,
      textY + 2,
      textWidth,
      options.titleAlign,
      sz(24),
      '400',
      theme.memoColor,
      sz(28),
    );
  }

  if (extra2) {
    textY = drawAlignedText(
      ctx,
      extra2,
      barPaddingX,
      textY + 2,
      textWidth,
      options.titleAlign,
      sz(24),
      '400',
      theme.memoColor,
      sz(28),
    );
  }

  if (extra3) {
    textY = drawAlignedText(
      ctx,
      extra3,
      barPaddingX,
      textY + 2,
      textWidth,
      options.titleAlign,
      sz(24),
      '400',
      theme.memoColor,
      sz(28),
    );
  }

  if (memo) {
    textY = drawAlignedText(
      ctx,
      memo,
      barPaddingX,
      textY + 4,
      textWidth,
      options.memoAlign,
      sz(26),
      '400',
      theme.memoColor,
      sz(32),
    );
  }

  if (coords) {
    textY = drawAlignedText(
      ctx,
      coords,
      barPaddingX,
      textY + 4,
      textWidth,
      options.memoAlign,
      sz(22),
      '400',
      theme.coordsColor,
      sz(28),
    );
  }

  if (footerPhrase) {
    drawAlignedText(
      ctx,
      footerPhrase,
      barPaddingX,
      textY + 4,
      textWidth,
      options.memoAlign,
      phraseSize,
      '400',
      theme.coordsColor,
      Math.max(18, Math.round(phraseSize * 1.1)),
    );
  }

  return canvas.toDataURL('image/jpeg', STAMP_JPEG_COMPRESS);
}

async function renderStampJpegCaptionOnWeb(
  stamp: Stamp,
  options: StampImageExportOptions,
): Promise<string> {
  const imageUri = resolveImageUri(stamp.imagePath);
  const img = await loadWebImage(imageUri);

  const scale = img.width > STAMP_JPEG_MAX_WIDTH ? STAMP_JPEG_MAX_WIDTH / img.width : 1;
  const imgWidth = Math.max(1, Math.round(img.width * scale));
  const imgHeight = Math.max(1, Math.round(img.height * scale));
  const padding = Math.max(12, Math.round(24 * (imgWidth / 1032)));
  const labels = resolveFieldLabels(options);
  const orgName = resolveOverlayOrgName(options);
  const footerPhrase = resolveOverlayFooterPhrase(options);
  const rows = buildCaptionTableRows(stamp, labels, {
    showDatetime: options.showDatetime,
    coordsLabel: options.coordsLabel,
    includeCoords: true,
  });

  const labelColWidth = Math.round(imgWidth * 0.28);
  const valueColWidth = imgWidth - labelColWidth;
  const textScale = stampTextSizeScale(options.stampTextSize ?? DEFAULT_STAMP_TEXT_SIZE);
  const fontSize = Math.max(14, Math.round(22 * (imgWidth / 1032) * textScale));
  const lineHeight = Math.max(20, Math.round(fontSize * 1.35));
  const cellPad = Math.max(6, Math.round(10 * (imgWidth / 1032)));

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) {
    throw new Error('캔버스를 사용할 수 없습니다.');
  }

  const rowHeights = rows.map((row) => {
    measureCtx.font = `700 ${fontSize}px sans-serif`;
    const labelLines = wrapCanvasLines(measureCtx, row.label, labelColWidth - cellPad * 2);
    measureCtx.font = `400 ${fontSize}px sans-serif`;
    const valueLines = wrapCanvasLines(measureCtx, row.value, valueColWidth - cellPad * 2);
    return Math.max(labelLines.length, valueLines.length) * lineHeight + cellPad * 2;
  });
  const tableHeight = rowHeights.reduce((sum, h) => sum + h, 0);
  const orgHeight = orgName ? lineHeight + 8 : 0;
  const phraseHeight = footerPhrase ? lineHeight + 8 : 0;
  const canvasWidth = imgWidth + padding * 2;
  const canvasHeight =
    padding + imgHeight + 16 + orgHeight + (tableHeight > 0 ? tableHeight + 8 : 0) + phraseHeight + padding;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('캔버스를 사용할 수 없습니다.');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(img, padding, padding, imgWidth, imgHeight);

  let y = padding + imgHeight + 16;
  if (orgName) {
    y =
      drawAlignedText(
        ctx,
        orgName,
        padding,
        y + fontSize,
        imgWidth,
        options.titleAlign,
        fontSize + 2,
        '700',
        '#111827',
        lineHeight,
      ) + 8;
  }

  if (rows.length > 0) {
    const tableTop = y;
    let rowY = tableTop;
    rows.forEach((row, index) => {
      const rowH = rowHeights[index];
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(padding, rowY, labelColWidth, rowH);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.strokeRect(padding, rowY, imgWidth, rowH);
      ctx.beginPath();
      ctx.moveTo(padding + labelColWidth, rowY);
      ctx.lineTo(padding + labelColWidth, rowY + rowH);
      ctx.stroke();

      measureCtx.font = `700 ${fontSize}px sans-serif`;
      const labelLines = wrapCanvasLines(measureCtx, row.label, labelColWidth - cellPad * 2);
      measureCtx.font = `400 ${fontSize}px sans-serif`;
      const valueLines = wrapCanvasLines(measureCtx, row.value, valueColWidth - cellPad * 2);

      ctx.fillStyle = '#111827';
      ctx.font = `700 ${fontSize}px sans-serif`;
      ctx.textAlign = 'left';
      labelLines.forEach((line, lineIndex) => {
        ctx.fillText(line, padding + cellPad, rowY + cellPad + fontSize + lineIndex * lineHeight);
      });

      ctx.fillStyle = '#374151';
      ctx.font = `400 ${fontSize}px sans-serif`;
      const valueX =
        options.memoAlign === 'center'
          ? padding + labelColWidth + valueColWidth / 2
          : options.memoAlign === 'right'
            ? padding + imgWidth - cellPad
            : padding + labelColWidth + cellPad;
      ctx.textAlign =
        options.memoAlign === 'center' ? 'center' : options.memoAlign === 'right' ? 'right' : 'left';
      valueLines.forEach((line, lineIndex) => {
        ctx.fillText(line, valueX, rowY + cellPad + fontSize + lineIndex * lineHeight);
      });

      rowY += rowH;
    });
    y = rowY + 8;
  }

  if (footerPhrase) {
    drawAlignedText(
      ctx,
      footerPhrase,
      padding,
      y + fontSize,
      imgWidth,
      options.memoAlign,
      Math.max(12, fontSize - 2),
      '400',
      '#6b7280',
      lineHeight,
    );
  }

  return canvas.toDataURL('image/jpeg', STAMP_JPEG_COMPRESS);
}

async function renderStampJpegOnWeb(
  stamp: Stamp,
  options: StampImageExportOptions,
): Promise<string> {
  if (options.textLayout === 'watermark') {
    return renderStampJpegWatermarkOnWeb(stamp, options);
  }
  return renderStampJpegCaptionOnWeb(stamp, options);
}

function downloadDataUriOnWeb(dataUri: string, fileName: string): void {
  const anchor = document.createElement('a');
  anchor.href = dataUri;
  anchor.download = fileName;
  anchor.click();
}

export function buildExportJpegFileName(
  exportBaseName: string,
  index: number,
  total: number,
): string {
  const base = sanitizeStampFileBaseName(exportBaseName.trim() || 'VoiceStamp');
  if (total <= 1) {
    return `${base}.jpg`;
  }
  return `${base}_${index + 1}.jpg`;
}



export function buildCaptionGalleryFileName(title: string): string {
  return buildGalleryStampFileName(title);
}

export async function renderStampJpegUri(
  stamp: Stamp,
  options: StampImageExportOptions,
  _captureNative?: CaptureStampForExport,
  renderParams?: StampRenderParams,
): Promise<string> {
  if (options.textLayout === 'watermark') {
    return renderStampWatermarkNative(stamp, options, renderParams);
  }

  return renderStampCaptionNative(stamp, options, renderParams);
}

export async function renderStampPreviewJpegUri(
  stamp: Stamp,
  options: StampImageExportOptions,
  sourceUri: string,
): Promise<string> {
  return renderStampJpegUri(stamp, options, undefined, {
    sourceUri,
    maxWidth: STAMP_PREVIEW_MAX_WIDTH,
    jpegCompress: STAMP_PREVIEW_JPEG_COMPRESS,
  });
}

export async function saveStampsAsJpegToGallery(
  stamps: Stamp[],
  options: StampImageExportOptions,
  exportBaseName: string,
  captureNative?: (stamp: Stamp, exportOptions: StampImageExportOptions) => Promise<string>,
): Promise<{ saved: number; failed: number }> {
  let saved = 0;
  let failed = 0;
  const total = stamps.length;

  for (let index = 0; index < stamps.length; index += 1) {
    const stamp = stamps[index];
    const fileName = buildExportJpegFileName(exportBaseName, index, total);
    const stampOptions: StampImageExportOptions = {
      ...options,
      ...fieldLabelsFromStamp(stamp),
    };
    try {
      let jpegUri: string;

      if (Platform.OS === 'web') {
        const dataUri = await renderStampJpegOnWeb(stamp, stampOptions);
        downloadDataUriOnWeb(dataUri, fileName);
        saved += 1;
        continue;
      }

      jpegUri = await renderStampJpegUri(stamp, stampOptions, captureNative);
      jpegUri = await embedCaptionExif(jpegUri, stamp);
      const albumName = extractStampGroupFromImagePath(stamp.imagePath) ?? undefined;
      await saveStampPhotoToGallery(jpegUri, fileName, albumName);
      saved += 1;
    } catch {
      failed += 1;
    }
  }

  return { saved, failed };
}
