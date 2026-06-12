import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import Marker, { ImageFormat } from 'react-native-image-marker';

import { buildCaptionLayout, captionTextX } from './captionLayout';
import {
  prepareExportPhoto,
  STAMP_JPEG_COMPRESS,
  type StampImageExportOptions,
} from './exportStampImage';
import { resolveImageUri } from './fileService';
import { pdfDisplayTitle } from './pdfTitleFormat';
import type { Stamp } from '../types/stamp';

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

export async function renderStampCaptionNative(
  stamp: Stamp,
  options: StampImageExportOptions,
): Promise<string> {
  const prepared = await prepareExportPhoto(resolveImageUri(stamp.imagePath));
  const title = pdfDisplayTitle(stamp.title, options.showDatetime);
  const memo = stamp.memo?.trim() ?? '';
  const layout = buildCaptionLayout(
    prepared.width,
    prepared.height,
    title,
    memo,
    options.titleAlign,
    options.memoAlign,
  );

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
      style: {
        color: '#111827',
        fontSize: layout.titleSize,
        bold: true,
        textAlign: layout.titleAlign,
      },
    },
  ];

  if (layout.memoY !== null && layout.memoText) {
    watermarkTexts.push({
      text: layout.memoText,
      positionOptions: {
        X: captionTextX(layout.memoAlign, layout.padding, layout.canvasWidth),
        Y: layout.memoY,
      },
      style: {
        color: '#374151',
        fontSize: layout.memoSize,
        textAlign: layout.memoAlign,
      },
    });
  }

  const markedUri = await Marker.markText({
    backgroundImage: { src: normalizeMarkedUri(withPhoto), scale: 1 },
    watermarkTexts,
    quality: Math.round(STAMP_JPEG_COMPRESS * 100),
    saveFormat: ImageFormat.jpg,
  });

  return normalizeMarkedUri(markedUri);
}
