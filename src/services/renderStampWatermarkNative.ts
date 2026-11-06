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
import { captionFieldTitle } from './pdfTitleFormat';
import { stampCoordinatesLine } from './stampCoords';
import { stampPlaceLine } from './stampPlace';
import { getWatermarkTheme } from './watermarkStyle';
import { stampTextSizeScale, type TextAlign } from './settingsService';
import { getOverlayShowMark } from './settingsService';
import { qrPixelSizeForPhoto, renderSourceUrlQrPngUri } from './qrCodeService';
import { resolveComposeQrUrl } from './overlayHomeQr';
import type { Stamp } from '../types/stamp';
import {
  OVERLAY_MARK_MAX_EDGE,
  overlayMarkDrawSize,
  resolveOverlayMarkFileUri,
} from './overlayMark';
import { parsePhotoNotePad } from './photoNotePad';
import { applyPhotoNotePadToUri } from './applyPhotoNotePad';
import {
  estimateShotClockWidth,
  resolveWatermarkShotLabel,
  shotClockTopLeft,
} from './shotClock';

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
  const notedUri = await applyPhotoNotePadToUri(
    prepared.uri,
    prepared.width,
    prepared.height,
    parsePhotoNotePad(stamp.photoNotePad),
    Math.round(jpegCompress * 100),
  );
  const labels = resolveFieldLabels(options);
  const title = formatLabeledValue(
    labels.titleFieldLabel,
    captionFieldTitle(stamp.title, options.showDatetime),
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
  const barHeight =
    overlayLines.length === 0
      ? 0
      : estimateWatermarkBarHeight(overlayLines.length, titleSize, paddingY);
  const extras: {
    src: string;
    scale: number;
    position: { X: number; Y: number };
  }[] = [];
  let qrSize = 0;

  const markUri =
    (await getOverlayShowMark()) ? await resolveOverlayMarkFileUri() : null;
  if (markUri) {
    const markSize = overlayMarkDrawSize(prepared.width);
    const markMargin = Math.max(8, Math.round(prepared.width * 0.02));
    extras.push({
      src: markUri,
      scale: markSize / OVERLAY_MARK_MAX_EDGE,
      position: { X: markMargin, Y: markMargin },
    });
  }

  const qrUrl = await resolveComposeQrUrl(stamp.sourceUrl);
  if (qrUrl) {
    const qrTarget = qrPixelSizeForPhoto(Math.min(prepared.width, prepared.height));
    const qr = await renderSourceUrlQrPngUri(qrUrl, qrTarget);
    if (qr) {
      qrSize = qr.size;
      const qrMargin = Math.max(8, Math.round(prepared.width * 0.02));
      extras.push({
        src: qr.uri,
        scale: 1,
        position: {
          X: prepared.width - qr.size - qrMargin,
          Y: Math.max(qrMargin, prepared.height - barHeight - qr.size - qrMargin),
        },
      });
    }
  }

  let baseUri = notedUri;
  if (text) {
    const markedUri = await Marker.markText({
      backgroundImage: { src: notedUri, scale: 1 },
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
    baseUri = normalizeMarkedUri(markedUri);
  }

  if (extras.length > 0) {
    const withMarks = await Marker.markImage({
      backgroundImage: { src: baseUri, scale: 1 },
      watermarkImages: extras,
      quality: Math.round(jpegCompress * 100),
      saveFormat: ImageFormat.jpg,
    });
    baseUri = normalizeMarkedUri(withMarks);
  }

  const shotLabel = await resolveWatermarkShotLabel(stamp);
  if (!shotLabel) {
    return baseUri;
  }
  const shotSize = Math.max(16, Math.round(26 * scale * textScale));
  const shotPos = shotClockTopLeft({
    photoWidth: prepared.width,
    photoHeight: prepared.height,
    barHeight,
    fontSize: shotSize,
    textWidth: estimateShotClockWidth(shotLabel, shotSize),
    qrSize,
  });
  const withClock = await Marker.markText({
    backgroundImage: { src: baseUri, scale: 1 },
    watermarkTexts: [
      {
        text: shotLabel,
        positionOptions: { X: shotPos.x, Y: shotPos.y },
        style: {
          color: '#FFFFFF',
          fontSize: shotSize,
          bold: true,
          shadowStyle: { dx: 0, dy: 1, radius: 3, color: '#000000' },
        },
      },
    ],
    quality: Math.round(jpegCompress * 100),
    saveFormat: ImageFormat.jpg,
  });
  return normalizeMarkedUri(withClock);
}
