import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

import { buildStampImageFileName, resolveImageUri } from './fileService';
import { saveStampPhotoToGallery } from './galleryService';
import { pdfDisplayTitle } from './pdfTitleFormat';
import type { TextAlign } from './settingsService';
import type { Stamp } from '../types/stamp';

export const STAMP_JPEG_MAX_WIDTH = 2048;
export const STAMP_JPEG_COMPRESS = 0.85;

export type StampImageExportOptions = {
  titleAlign: TextAlign;
  memoAlign: TextAlign;
  showDatetime: boolean;
};

export async function compressStampJpeg(sourceUri: string): Promise<string> {
  const result = await manipulateAsync(
    sourceUri,
    [{ resize: { width: STAMP_JPEG_MAX_WIDTH } }],
    { compress: STAMP_JPEG_COMPRESS, format: SaveFormat.JPEG },
  );
  return result.uri;
}

function loadWebImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
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

async function renderStampJpegOnWeb(
  stamp: Stamp,
  options: StampImageExportOptions,
): Promise<string> {
  const imageUri = resolveImageUri(stamp.imagePath);
  const img = await loadWebImage(imageUri);

  const scale = img.width > STAMP_JPEG_MAX_WIDTH ? STAMP_JPEG_MAX_WIDTH / img.width : 1;
  const imgWidth = Math.max(1, Math.round(img.width * scale));
  const imgHeight = Math.max(1, Math.round(img.height * scale));

  const padding = 24;
  const contentWidth = imgWidth;
  const title = pdfDisplayTitle(stamp.title, options.showDatetime);
  const memo = stamp.memo?.trim() ?? '';

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) {
    throw new Error('이미지 내보내기를 사용할 수 없습니다.');
  }

  measureCtx.font = '700 36px sans-serif';
  const titleLines = wrapCanvasLines(measureCtx, title, contentWidth);
  measureCtx.font = '400 28px sans-serif';
  const memoLines = memo ? wrapCanvasLines(measureCtx, memo, contentWidth) : [];

  const canvasWidth = contentWidth + padding * 2;
  const canvasHeight =
    padding +
    imgHeight +
    16 +
    titleLines.length * 44 +
    (memoLines.length > 0 ? 12 + memoLines.length * 36 : 0) +
    padding;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('이미지 내보내기를 사용할 수 없습니다.');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(img, padding, padding, imgWidth, imgHeight);

  let textY = padding + imgHeight + 40;
  textY =
    drawAlignedText(
      ctx,
      title,
      padding,
      textY,
      contentWidth,
      options.titleAlign,
      36,
      '700',
      '#111827',
      44,
    ) + 4;

  if (memo) {
    drawAlignedText(
      ctx,
      memo,
      padding,
      textY + 8,
      contentWidth,
      options.memoAlign,
      28,
      '400',
      '#374151',
      36,
    );
  }

  return canvas.toDataURL('image/jpeg', STAMP_JPEG_COMPRESS);
}

function downloadDataUriOnWeb(dataUri: string, fileName: string): void {
  const anchor = document.createElement('a');
  anchor.href = dataUri;
  anchor.download = fileName;
  anchor.click();
}

export async function saveStampsAsJpegToGallery(
  stamps: Stamp[],
  options: StampImageExportOptions,
  captureNative?: (stamp: Stamp, exportOptions: StampImageExportOptions) => Promise<string>,
): Promise<{ saved: number; failed: number }> {
  let saved = 0;
  let failed = 0;

  for (const stamp of stamps) {
    try {
      let jpegUri: string;

      if (Platform.OS === 'web') {
        const dataUri = await renderStampJpegOnWeb(stamp, options);
        const fileName = buildStampImageFileName(stamp.title, stamp.id, 'jpg');
        downloadDataUriOnWeb(dataUri, fileName);
        saved += 1;
        continue;
      }

      if (!captureNative) {
        throw new Error('이미지 캡처를 사용할 수 없습니다.');
      }

      const capturedUri = await captureNative(stamp, options);
      jpegUri = await compressStampJpeg(capturedUri);
      await saveStampPhotoToGallery(jpegUri);
      saved += 1;
    } catch {
      failed += 1;
    }
  }

  return { saved, failed };
}
