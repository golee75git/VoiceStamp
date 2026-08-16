import Marker, { ImageFormat, Position, TextBackgroundType } from 'react-native-image-marker';

import { resolveImageUri } from './fileService';
import {
  prepareExportPhoto,
  STAMP_JPEG_COMPRESS,
  type StampImageExportOptions,
  type StampRenderParams,
} from './exportStampImage';
import { resolveOverlayFooterPhrase, resolveOverlayOrgName } from './overlayText';
import { formatLabeledValue, resolveFieldLabels } from './fieldLabels';
import { stampDisplayTitle } from './stampFloor';
import { stampCoordinatesLine } from './stampCoords';
import { stampPlaceLine } from './stampPlace';
import { getWatermarkTheme } from './watermarkStyle';
import { stampTextSizeScale, type TextAlign } from './settingsService';
import { qrPixelSizeForPhoto, renderSourceUrlQrPngUri } from './qrCodeService';
import { normalizeHttpUrl } from './qrUrlExtractService';
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

/** Rough bar height so QR sits above the stretchX watermark text band. */
function estimateWatermarkBarHeight(
  lineCount: number,
  titleSize: number,
  paddingY: number,
): number {
  const lines = Math.max(1, lineCount);
  return paddingY * 2 + lines * Math.round(titleSize * 1.3);
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
  const orgName = resolveOverlayOrgName(options);
  const footerPhrase = resolveOverlayFooterPhrase(options);
  const theme = getWatermarkTheme(options.watermarkStyle);
  const scale = prepared.width / EXPORT_PHOTO_WIDTH;
  const textScale = stampTextSizeScale(options.stampTextSize ?? 'medium');
  const titleSize = Math.max(18, Math.round(32 * scale * textScale));
  const paddingX = Math.round(20 * scale);
  const paddingY = Math.round(16 * scale);

  const overlayLines: string[] = [];
  if (orgName) {
    overlayLines.push(orgName);
  }
  if (title) {
    overlayLines.push(title);
  }
  if (place) {
    overlayLines.push(place);
  }
  if (extra1) {
    overlayLines.push(extra1);
  }
  if (extra2) {
    overlayLines.push(extra2);
  }
  if (extra3) {
    overlayLines.push(extra3);
  }
  if (memo) {
    overlayLines.push(memo);
  }
  if (coords) {
    overlayLines.push(coords);
  }
  if (footerPhrase) {
    overlayLines.push(footerPhrase);
  }
  const text = overlayLines.join('\n');

  const markedUri = await Marker.markText({
    backgroundImage: { src: prepared.uri, scale: 1 },
    watermarkTexts: [
      {
        text,
        positionOptions: { position: watermarkPosition(options.titleAlign) },
        style: {
          color: theme.titleColor,
          fontSize: titleSize,
          bold: true,
          textAlign: options.titleAlign,
          textBackgroundStyle: {
            type: TextBackgroundType.stretchX,
            color: theme.nativeBarColor,
            paddingX,
            paddingY,
          },
        },
      },
    ],
    quality: Math.round(jpegCompress * 100),
    saveFormat: ImageFormat.jpg,
  });

  const baseUri = normalizeMarkedUri(markedUri);
  const safeSourceUrl = normalizeHttpUrl(stamp.sourceUrl ?? '');
  if (!safeSourceUrl) {
    return baseUri;
  }

  const qrTarget = qrPixelSizeForPhoto(Math.min(prepared.width, prepared.height));
  const qr = await renderSourceUrlQrPngUri(safeSourceUrl, qrTarget);
  if (!qr) {
    return baseUri;
  }

  const qrMargin = Math.max(8, Math.round(prepared.width * 0.02));
  const barHeight = estimateWatermarkBarHeight(overlayLines.length, titleSize, paddingY);
  const qrX = prepared.width - qr.size - qrMargin;
  const qrY = Math.max(qrMargin, prepared.height - barHeight - qr.size - qrMargin);

  const withQr = await Marker.markImage({
    backgroundImage: { src: baseUri, scale: 1 },
    watermarkImages: [
      {
        src: qr.uri,
        scale: 1,
        position: { X: qrX, Y: qrY },
      },
    ],
    quality: Math.round(jpegCompress * 100),
    saveFormat: ImageFormat.jpg,
  });

  return normalizeMarkedUri(withQr);
}
