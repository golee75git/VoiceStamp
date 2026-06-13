import Marker, { ImageFormat, Position, TextBackgroundType } from 'react-native-image-marker';

import { resolveImageUri } from './fileService';
import {
  prepareExportPhoto,
  STAMP_JPEG_COMPRESS,
  type StampImageExportOptions,
} from './exportStampImage';
import { pdfDisplayTitle } from './pdfTitleFormat';
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
): Promise<string> {
  const prepared = await prepareExportPhoto(resolveImageUri(stamp.imagePath));
  const title = pdfDisplayTitle(stamp.title, options.showDatetime);
  const memo = stamp.memo?.trim() ?? '';
  const scale = prepared.width / EXPORT_PHOTO_WIDTH;
  const titleSize = Math.max(18, Math.round(32 * scale));
  const paddingX = Math.round(20 * scale);
  const paddingY = Math.round(16 * scale);
  const text = memo ? `${title}\n${memo}` : title;

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
    quality: Math.round(STAMP_JPEG_COMPRESS * 100),
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
