import Marker, { ImageFormat, Position, TextBackgroundType } from 'react-native-image-marker';

import { resolveImageUri } from './fileService';
import {
  prepareExportPhoto,
  STAMP_JPEG_COMPRESS,
  type StampImageExportOptions,
  type StampRenderParams,
} from './exportStampImage';
import { stampDisplayTitle } from './stampFloor';
import { stampCoordinatesLine } from './stampCoords';
import {
  computeWatermarkBarHeight,
  createNativeWatermarkBarUri,
  getWatermarkTheme,
} from './watermarkStyle';
import type { TextAlign } from './settingsService';
import type { Stamp } from '../types/stamp';

const EXPORT_PHOTO_WIDTH = 1032;

function watermarkPosition(align: TextAlign): Position {
  if (align === 'center') {
    return Position.bottomCenter;
  }
  if (align === 'right') {
    return Position.bottomRight;
  }
  return Position.bottomLeft;
}

function normalizeMarkedUri(markedUri: string): string {
  if (markedUri.startsWith('file://') || markedUri.startsWith('content://')) {
    return markedUri;
  }
  if (markedUri.startsWith('/')) {
    return `file://${markedUri}`;
  }
  return markedUri;
}

export async function renderStampWatermarkNative(
  stamp: Stamp,
  options: StampImageExportOptions,
  renderParams?: StampRenderParams,
): Promise<string> {
  const photoUri = renderParams?.sourceUri ?? resolveImageUri(stamp.imagePath);
  const maxWidth = renderParams?.maxWidth;
  const jpegCompress = renderParams?.jpegCompress ?? STAMP_JPEG_COMPRESS;
  const prepared = await prepareExportPhoto(photoUri, maxWidth);
  const title = stampDisplayTitle(stamp, options.showDatetime);
  const memo = stamp.memo?.trim() ?? '';
  const coords = stampCoordinatesLine(stamp, options.coordsLabel);
  const theme = getWatermarkTheme(options.watermarkStyle);
  const scale = prepared.width / EXPORT_PHOTO_WIDTH;
  const titleSize = Math.max(18, Math.round(32 * scale));
  const paddingX = Math.round(20 * scale);
  const paddingY = Math.round(16 * scale);
  const overlayLines = [title];
  if (memo) {
    overlayLines.push(memo);
  }
  if (coords) {
    overlayLines.push(coords);
  }
  const text = overlayLines.join('\n');

  let backgroundUri = prepared.uri;

  if (options.watermarkStyle === 'red_stripes') {
    const barHeight = computeWatermarkBarHeight(prepared.width, title, memo, coords);
    const barUri = await createNativeWatermarkBarUri(prepared.width, barHeight, options.watermarkStyle);
    const withBar = await Marker.markImage({
      backgroundImage: { src: prepared.uri, scale: 1 },
      watermarkImages: [
        {
          src: barUri,
          scale: 1,
          position: {
            X: 0,
            Y: Math.max(0, prepared.height - barHeight),
          },
        },
      ],
      quality: 100,
      saveFormat: ImageFormat.jpg,
    });
    backgroundUri = normalizeMarkedUri(withBar);
  }

  const textStyle: {
    color: string;
    fontSize: number;
    bold: boolean;
    textAlign: TextAlign;
    textBackgroundStyle?: {
      type: TextBackgroundType;
      color: string;
      paddingX: number;
      paddingY: number;
    };
  } = {
    color: theme.titleColor,
    fontSize: titleSize,
    bold: true,
    textAlign: options.titleAlign,
  };

  if (options.watermarkStyle === 'solid_dark') {
    textStyle.textBackgroundStyle = {
      type: TextBackgroundType.stretchX,
      color: theme.nativeBarColor,
      paddingX,
      paddingY,
    };
  }

  const markedUri = await Marker.markText({
    backgroundImage: { src: backgroundUri, scale: 1 },
    watermarkTexts: [
      {
        text,
        positionOptions: { position: watermarkPosition(options.titleAlign) },
        style: textStyle,
      },
    ],
    quality: Math.round(jpegCompress * 100),
    saveFormat: ImageFormat.jpg,
  });

  return normalizeMarkedUri(markedUri);
}
