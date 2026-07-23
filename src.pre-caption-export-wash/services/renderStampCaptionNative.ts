import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import Marker, { ImageFormat, TextBackgroundType } from 'react-native-image-marker';

import { wrapTextLines, captionTextX } from './captionLayout';
import { buildCaptionTableRows } from './captionTable';
import {
  resolveOverlayFooterPhrase,
  resolveOverlayOrgName,
} from './overlayText';
import { resolveFieldLabels } from './fieldLabels';
import {
  prepareExportPhoto,
  type StampImageExportOptions,
  type StampRenderParams,
} from './exportStampImage';
import { resolveImageUri } from './fileService';
import type { TextAlign } from './settingsService';
import { stampTextSizeScale } from './settingsService';
import type { Stamp } from '../types/stamp';

const CAPTION_JPEG_COMPRESS = 0.95;
const CAPTION_REFERENCE_PHOTO_WIDTH = 1032;

/** Opaque white RGBA 1×1. */
const WHITE_1X1_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==';
/** Label cell background #f3f4f6 */
const GRAY_1X1_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4/OXbfwAJmAPdtH26kgAAAABJRU5ErkJggg==';
/** Table border #d1d5db */
const BORDER_1X1_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGO4ePX2fwAIfQOBtuft9wAAAABJRU5ErkJggg==';

function normalizeMarkedUri(markedUri: string): string {
  if (markedUri.startsWith('file://') || markedUri.startsWith('content://')) {
    return markedUri;
  }
  if (markedUri.startsWith('/')) {
    return `file://${markedUri}`;
  }
  return markedUri;
}

async function createSolidJpeg(
  base64Png: string,
  cacheName: string,
  width: number,
  height: number,
): Promise<string> {
  const tempUri = `${FileSystem.cacheDirectory}${cacheName}`;
  await FileSystem.writeAsStringAsync(tempUri, base64Png, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const resized = await manipulateAsync(
    tempUri,
    [{ resize: { width: Math.max(1, width), height: Math.max(1, height) } }],
    { compress: 1, format: SaveFormat.JPEG },
  );
  return resized.uri;
}

function cellTextStyle(
  color: string,
  fontSize: number,
  align: TextAlign,
  bold: boolean,
) {
  return {
    color,
    fontSize,
    bold,
    textAlign: align,
    textBackgroundStyle: {
      type: TextBackgroundType.none,
      color: '#00000000',
      paddingX: 0,
      paddingY: 0,
    },
  };
}

export async function renderStampCaptionNative(
  stamp: Stamp,
  options: StampImageExportOptions,
  renderParams?: StampRenderParams,
): Promise<string> {
  const photoUri = renderParams?.sourceUri ?? resolveImageUri(stamp.imagePath);
  const maxWidth = renderParams?.maxWidth;
  const jpegCompress = renderParams?.jpegCompress ?? CAPTION_JPEG_COMPRESS;
  const prepared = await prepareExportPhoto(photoUri, maxWidth);
  const labels = resolveFieldLabels(options);
  const orgName = resolveOverlayOrgName(options);
  const footerPhrase = resolveOverlayFooterPhrase(options);
  const rows = buildCaptionTableRows(stamp, labels, {
    showDatetime: options.showDatetime,
    coordsLabel: options.coordsLabel,
    includeCoords: true,
  });

  const imgWidth = prepared.width;
  const imgHeight = prepared.height;
  const padding = Math.max(12, Math.round(24 * (imgWidth / CAPTION_REFERENCE_PHOTO_WIDTH)));
  const textScale = stampTextSizeScale(options.stampTextSize ?? 'medium');
  const fontSize = Math.max(14, Math.round(22 * (imgWidth / CAPTION_REFERENCE_PHOTO_WIDTH) * textScale));
  const lineHeight = Math.max(20, Math.round(fontSize * 1.35));
  const cellPad = Math.max(6, Math.round(10 * (imgWidth / CAPTION_REFERENCE_PHOTO_WIDTH)));
  const labelColWidth = Math.round(imgWidth * 0.28);
  const valueColWidth = imgWidth - labelColWidth;
  const borderW = Math.max(1, Math.round(imgWidth / 1032));

  const rowHeights = rows.map((row) => {
    const labelLines = wrapTextLines(row.label, labelColWidth - cellPad * 2, fontSize);
    const valueLines = wrapTextLines(row.value, valueColWidth - cellPad * 2, fontSize);
    return Math.max(labelLines.length, valueLines.length) * lineHeight + cellPad * 2;
  });
  const tableHeight = rowHeights.reduce((sum, h) => sum + h, 0);
  const orgSize = Math.max(16, Math.round(28 * (imgWidth / CAPTION_REFERENCE_PHOTO_WIDTH) * textScale));
  const orgLineHeight = Math.max(22, Math.round(orgSize * 1.3));
  const orgLines = orgName ? wrapTextLines(orgName, imgWidth, orgSize) : [];
  const orgHeight = orgLines.length > 0 ? orgLines.length * orgLineHeight + 8 : 0;
  const phraseSize = Math.max(12, fontSize - 2);
  const phraseLineHeight = Math.max(18, Math.round(phraseSize * 1.35));
  const phraseLines = footerPhrase ? wrapTextLines(footerPhrase, imgWidth, phraseSize) : [];
  const phraseHeight = phraseLines.length > 0 ? phraseLines.length * phraseLineHeight + 8 : 0;

  const canvasWidth = imgWidth + padding * 2;
  const canvasHeight =
    padding +
    imgHeight +
    16 +
    orgHeight +
    (tableHeight > 0 ? tableHeight + 8 : 0) +
    phraseHeight +
    padding;

  const canvasUri = await createSolidJpeg(
    WHITE_1X1_PNG_BASE64,
    'caption-white-1x1.png',
    canvasWidth,
    canvasHeight,
  );
  const overlayImages: {
    src: string;
    scale: number;
    position: { X: number; Y: number };
  }[] = [
    {
      src: prepared.uri,
      scale: 1,
      position: { X: padding, Y: padding },
    },
  ];

  let cursorY = padding + imgHeight + 16 + orgHeight;

  for (let i = 0; i < rows.length; i += 1) {
    const rowH = rowHeights[i];
    const rowGray = await createSolidJpeg(
      GRAY_1X1_PNG_BASE64,
      `caption-gray-row-${i}.png`,
      labelColWidth,
      rowH,
    );
    overlayImages.push({
      src: rowGray,
      scale: 1,
      position: { X: padding, Y: cursorY },
    });
    const hLine = await createSolidJpeg(
      BORDER_1X1_PNG_BASE64,
      `caption-hline-${i}.png`,
      imgWidth,
      borderW,
    );
    overlayImages.push({
      src: hLine,
      scale: 1,
      position: { X: padding, Y: cursorY },
    });
    const vEdge = await createSolidJpeg(
      BORDER_1X1_PNG_BASE64,
      `caption-vedge-${i}.png`,
      borderW,
      rowH,
    );
    overlayImages.push(
      { src: vEdge, scale: 1, position: { X: padding, Y: cursorY } },
      { src: vEdge, scale: 1, position: { X: padding + labelColWidth, Y: cursorY } },
      { src: vEdge, scale: 1, position: { X: padding + imgWidth - borderW, Y: cursorY } },
    );
    cursorY += rowH;
  }

  if (rows.length > 0) {
    const bottomLine = await createSolidJpeg(
      BORDER_1X1_PNG_BASE64,
      'caption-hline-bottom.png',
      imgWidth,
      borderW,
    );
    overlayImages.push({
      src: bottomLine,
      scale: 1,
      position: { X: padding, Y: cursorY - borderW },
    });
  }

  const withChrome = await Marker.markImage({
    backgroundImage: { src: canvasUri, scale: 1 },
    watermarkImages: overlayImages,
    quality: 1,
    saveFormat: ImageFormat.png,
  });

  const watermarkTexts: {
    text: string;
    positionOptions: { X: number; Y: number };
    style: ReturnType<typeof cellTextStyle>;
  }[] = [];

  let textY = padding + imgHeight + 16;
  if (orgName && orgLines.length > 0) {
    orgLines.forEach((line, lineIndex) => {
      watermarkTexts.push({
        text: line,
        positionOptions: {
          X: captionTextX(options.titleAlign, padding, canvasWidth),
          Y: textY + lineIndex * orgLineHeight,
        },
        style: cellTextStyle('#111827', orgSize, options.titleAlign, true),
      });
    });
    textY += orgHeight;
  }

  let rowY = textY;
  rows.forEach((row, index) => {
    const rowH = rowHeights[index];
    const labelLines = wrapTextLines(row.label, labelColWidth - cellPad * 2, fontSize);
    const valueLines = wrapTextLines(row.value, valueColWidth - cellPad * 2, fontSize);

    labelLines.forEach((line, lineIndex) => {
      watermarkTexts.push({
        text: line,
        positionOptions: {
          X: padding + cellPad,
          Y: rowY + cellPad + lineIndex * lineHeight,
        },
        style: cellTextStyle('#111827', fontSize, 'left', true),
      });
    });

    const valueAlign = options.memoAlign;
    const valueX =
      valueAlign === 'center'
        ? padding + labelColWidth + valueColWidth / 2
        : valueAlign === 'right'
          ? padding + imgWidth - cellPad
          : padding + labelColWidth + cellPad;
    valueLines.forEach((line, lineIndex) => {
      watermarkTexts.push({
        text: line,
        positionOptions: {
          X: valueX,
          Y: rowY + cellPad + lineIndex * lineHeight,
        },
        style: cellTextStyle('#374151', fontSize, valueAlign, false),
      });
    });

    rowY += rowH;
  });

  if (rows.length > 0) {
    rowY += 8;
  }

  if (footerPhrase && phraseLines.length > 0) {
    phraseLines.forEach((line, lineIndex) => {
      watermarkTexts.push({
        text: line,
        positionOptions: {
          X: captionTextX(options.memoAlign, padding, canvasWidth),
          Y: rowY + lineIndex * phraseLineHeight,
        },
        style: cellTextStyle('#6b7280', phraseSize, options.memoAlign, false),
      });
    });
  }

  const pngUri =
    watermarkTexts.length > 0
      ? await Marker.markText({
          backgroundImage: { src: normalizeMarkedUri(withChrome), scale: 1 },
          watermarkTexts,
          quality: 100,
          saveFormat: ImageFormat.png,
        })
      : withChrome;

  const jpeg = await manipulateAsync(normalizeMarkedUri(pngUri), [], {
    compress: jpegCompress,
    format: SaveFormat.JPEG,
  });

  return jpeg.uri;
}
