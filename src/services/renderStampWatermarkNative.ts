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
  const coords = stampCoordinatesLine(stamp);
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

  const markedUri = await Marker.markText({
    backgroundImage: { src: prepared.uri, scale: 1 },
    watermarkTexts: [
      {
        text,
        positionOptions: { position: watermarkPosition(options.titleAlign) },
        style: {
          color: '#FFFFFF',
          fontSize: titleSize,
          bold: true,
          textAlign: options.titleAlign,
          textBackgroundStyle: {
            type: TextBackgroundType.stretchX,
            color: '#0000008C',
            paddingX,
            paddingY,
          },
        },
      },
    ],
    quality: Math.round(jpegCompress * 100),
    saveFormat: ImageFormat.jpg,
  });

  if (markedUri.startsWith('file://') || markedUri.startsWith('content://')) {
    return markedUri;
  }
  if (markedUri.startsWith('/')) {
    return `file://${markedUri}`;
  }
  return markedUri;
}
