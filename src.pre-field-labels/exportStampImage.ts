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
import type { StampTextLayout, TextAlign, CoordsLabelMode, WatermarkStyle } from './settingsService';
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

export type StampImageExportOptions = OverlayTextFields & {
  titleAlign: TextAlign;
  memoAlign: TextAlign;
  showDatetime: boolean;
  textLayout: StampTextLayout;
  coordsLabel: CoordsLabelMode;
  watermarkStyle: WatermarkStyle;
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

  const title = stampDisplayTitle(stamp, options.showDatetime);
  const memo = stamp.memo?.trim() ?? '';
  const place = stampPlaceLine(stamp);
  const coords = stampCoordinatesLine(stamp, options.coordsLabel);
  const orgName = resolveOverlayOrgName(options) ?? '';
  const footerPhrase = resolveOverlayFooterPhrase(options) ?? '';
  const phraseSize = overlayPhraseFontSize(22);
  const barPaddingX = 20;
  const barPaddingY = 16;
  const textWidth = imgWidth - barPaddingX * 2;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) {
    throw new Error('??? ????? ??? ? ????.');
  }

  measureCtx.font = '700 26px sans-serif';
  const orgLines = orgName ? wrapCanvasLines(measureCtx, orgName, textWidth) : [];

  measureCtx.font = '700 32px sans-serif';
  const titleLines = wrapCanvasLines(measureCtx, title, textWidth);
  measureCtx.font = '400 24px sans-serif';
  const placeLines = place ? wrapCanvasLines(measureCtx, place, textWidth) : [];
  measureCtx.font = '400 26px sans-serif';
  const memoLines = memo ? wrapCanvasLines(measureCtx, memo, textWidth) : [];
  measureCtx.font = '400 22px sans-serif';
  const coordsLines = coords ? wrapCanvasLines(measureCtx, coords, textWidth) : [];
  measureCtx.font = `400 ${phraseSize}px sans-serif`;
  const phraseLines = footerPhrase ? wrapCanvasLines(measureCtx, footerPhrase, textWidth) : [];

  const barHeight =
    barPaddingY +
    (orgLines.length > 0 ? orgLines.length * 30 + 4 : 0) +
    titleLines.length * 38 +
    (placeLines.length > 0 ? 6 + placeLines.length * 28 : 0) +
    (memoLines.length > 0 ? 8 + memoLines.length * 32 : 0) +
    (coordsLines.length > 0 ? 6 + coordsLines.length * 28 : 0) +
    (phraseLines.length > 0 ? 4 + phraseLines.length * 24 : 0) +
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

  let textY = imgHeight - barHeight + barPaddingY + (orgName ? 22 : 28);

  if (orgName) {
    textY =
      drawAlignedText(
        ctx,
        orgName,
        barPaddingX,
        textY,
        textWidth,
        options.titleAlign,
        26,
        '700',
        theme.titleColor,
        30,
      ) + 4;
  }

  textY =
    drawAlignedText(
      ctx,
      title,
      barPaddingX,
      textY,
      textWidth,
      options.titleAlign,
      32,
      '700',
      theme.titleColor,
      38,
    ) + 4;

  if (place) {
    textY = drawAlignedText(
      ctx,
      place,
      barPaddingX,
      textY + 2,
      textWidth,
      options.titleAlign,
      24,
      '400',
      theme.memoColor,
      28,
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
      26,
      '400',
      theme.memoColor,
      32,
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
      22,
      '400',
      theme.coordsColor,
      28,
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
      24,
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

  const title = stampDisplayTitle(stamp, options.showDatetime);
  const memo = stamp.memo?.trim() ?? '';
  const place = stampPlaceLine(stamp);
  const coords = stampCoordinatesLine(stamp, options.coordsLabel);
  const orgName = resolveOverlayOrgName(options);
  const footerPhrase = resolveOverlayFooterPhrase(options);
  const layout = buildCaptionLayout(
    imgWidth,
    imgHeight,
    title,
    memo,
    options.titleAlign,
    options.memoAlign,
    coords,
    orgName,
    footerPhrase,
    place,
  );

  const canvas = document.createElement('canvas');
  canvas.width = layout.canvasWidth;
  canvas.height = layout.canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('??? ????? ??? ? ????.');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight);
  ctx.drawImage(img, layout.padding, layout.padding, imgWidth, imgHeight);

  if (layout.orgY !== null && layout.orgText) {
    drawAlignedText(
      ctx,
      layout.orgText,
      layout.padding,
      layout.orgY,
      imgWidth,
      layout.titleAlign,
      layout.orgSize,
      '700',
      '#111827',
      layout.orgLineHeight,
    );
  }

  let textY = layout.titleY;
  textY =
    drawAlignedText(
      ctx,
      layout.titleText,
      layout.padding,
      textY,
      imgWidth,
      layout.titleAlign,
      layout.titleSize,
      '700',
      '#111827',
      layout.titleLineHeight,
    ) + 4;

  if (layout.placeY !== null && layout.placeText) {
    drawAlignedText(
      ctx,
      layout.placeText,
      layout.padding,
      layout.placeY,
      imgWidth,
      layout.placeAlign,
      layout.placeSize,
      '400',
      '#374151',
      layout.placeLineHeight,
    );
  }

  if (layout.memoY !== null && layout.memoText) {
    textY = drawAlignedText(
      ctx,
      layout.memoText,
      layout.padding,
      layout.memoY,
      imgWidth,
      layout.memoAlign,
      layout.memoSize,
      '400',
      '#374151',
      layout.memoLineHeight,
    );
  }

  if (layout.coordsY !== null && layout.coordsText) {
    textY = drawAlignedText(
      ctx,
      layout.coordsText,
      layout.padding,
      layout.coordsY,
      imgWidth,
      layout.coordsAlign,
      layout.coordsSize,
      '400',
      '#6b7280',
      layout.coordsLineHeight,
    );
  }

  if (layout.phraseY !== null && layout.phraseText) {
    drawAlignedText(
      ctx,
      layout.phraseText,
      layout.padding,
      layout.phraseY,
      imgWidth,
      layout.phraseAlign,
      layout.phraseSize,
      '400',
      '#6b7280',
      layout.phraseLineHeight,
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
    try {
      let jpegUri: string;

      if (Platform.OS === 'web') {
        const dataUri = await renderStampJpegOnWeb(stamp, options);
        downloadDataUriOnWeb(dataUri, fileName);
        saved += 1;
        continue;
      }

      jpegUri = await renderStampJpegUri(stamp, options, captureNative);
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
