import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import Marker, { ImageFormat, TextBackgroundType } from 'react-native-image-marker';

import { buildCaptionLayout, captionTextX } from './captionLayout';
import {
  prepareExportPhoto,
  type StampImageExportOptions,
  type StampRenderParams,
} from './exportStampImage';
import { resolveImageUri } from './fileService';
import { stampDisplayTitle } from './stampFloor';
import { stampCoordinatesLine } from './stampCoords';
import type { TextAlign } from './settingsService';
import type { Stamp } from '../types/stamp';

const CAPTION_JPEG_COMPRESS = 0.95;

const WHITE_1X1_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

function normalizeMarkedUri(markedUri: string): string {
  if (markedUri.startsWith('file://') || markedUri.startsWith('content://')) {
    return markedUri;
  }
  if (markedUri.startsWith('/')) {
    return `file://${markedUri}`;
  }
  return markedUri;
}

async function createWhiteCanvas(width: number, height: number): Promise<string> {
  const tempUri = `${FileSystem.cacheDirectory}caption-white-1x1.png`;
  await FileSystem.writeAsStringAsync(tempUri, WHITE_1X1_PNG_BASE64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const resized = await manipulateAsync(tempUri, [{ resize: { width, height } }], {
    compress: 1,
    format: SaveFormat.PNG,
  });
  return resized.uri;
}

function captionTextStyle(
  color: string,
  fontSize: number,
  align: TextAlign,
  bold: boolean,
  paddingY: number,
) {
  return {
    color,
    fontSize,
    bold,
    textAlign: align,
    textBackgroundStyle: {
      type: TextBackgroundType.stretchX,
      color: '#FFFFFF',
      paddingX: 0,
      paddingY,
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
  const title = stampDisplayTitle(stamp, options.showDatetime);
  const memo = stamp.memo?.trim() ?? '';
  const coords = stampCoordinatesLine(stamp);
  const layout = buildCaptionLayout(
    prepared.width,
    prepared.height,
    title,
    memo,
    options.titleAlign,
    options.memoAlign,
    coords,
  );
  const textBackgroundPaddingY = Math.max(4, Math.round(8 * (layout.padding / 24)));

  const canvasUri = await createWhiteCanvas(layout.canvasWidth, layout.canvasHeight);
  const withPhoto = await Marker.markImage({
    backgroundImage: { src: canvasUri, scale: 1 },
    watermarkImages: [
      {
        src: prepared.uri,
        scale: 1,
        position: {
          X: layout.padding,
          Y: layout.padding,
        },
      },
    ],
    quality: 1,
    saveFormat: ImageFormat.png,
  });

  const watermarkTexts = [
    {
      text: layout.titleText,
      positionOptions: {
        X: captionTextX(layout.titleAlign, layout.padding, layout.canvasWidth),
        Y: layout.titleY,
      },
      style: captionTextStyle(
        '#111827',
        layout.titleSize,
        layout.titleAlign,
        true,
        textBackgroundPaddingY,
      ),
    },
  ];

  if (layout.memoY !== null && layout.memoText) {
    watermarkTexts.push({
      text: layout.memoText,
      positionOptions: {
        X: captionTextX(layout.memoAlign, layout.padding, layout.canvasWidth),
        Y: layout.memoY,
      },
      style: captionTextStyle(
        '#374151',
        layout.memoSize,
        layout.memoAlign,
        false,
        textBackgroundPaddingY,
      ),
    });
  }

  if (layout.coordsY !== null && layout.coordsText) {
    watermarkTexts.push({
      text: layout.coordsText,
      positionOptions: {
        X: captionTextX(layout.coordsAlign, layout.padding, layout.canvasWidth),
        Y: layout.coordsY,
      },
      style: captionTextStyle(
        '#6b7280',
        layout.coordsSize,
        layout.coordsAlign,
        false,
        textBackgroundPaddingY,
      ),
    });
  }

  const pngUri = await Marker.markText({
    backgroundImage: { src: normalizeMarkedUri(withPhoto), scale: 1 },
    watermarkTexts,
    quality: 100,
    saveFormat: ImageFormat.png,
  });

  const jpeg = await manipulateAsync(
    normalizeMarkedUri(pngUri),
    [],
    { compress: jpegCompress, format: SaveFormat.JPEG },
  );

  return jpeg.uri;
}
