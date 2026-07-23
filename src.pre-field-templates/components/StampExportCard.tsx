import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { resolveImageUri } from '../services/fileService';
import type { PreparedExportPhoto, StampImageExportOptions } from '../services/exportStampImage';
import { stampDisplayTitle } from '../services/stampFloor';
import { stampCoordinatesLine } from '../services/stampCoords';
import { stampPlaceLine } from '../services/stampPlace';
import { fieldLabelsFromStamp, formatLabeledValue, resolveFieldLabels } from '../services/fieldLabels';
import { buildCaptionTableRows } from '../services/captionTable';
import { getWatermarkTheme } from '../services/watermarkStyle';
import { WatermarkBarBackground } from './WatermarkBarBackground';
import { stampTextSizeScale } from '../services/settingsService';
import type { Stamp } from '../types/stamp';

export const STAMP_EXPORT_CARD_WIDTH = 1080;

const PHOTO_WIDTH = STAMP_EXPORT_CARD_WIDTH - 48;
const FALLBACK_ASPECT_RATIO = PHOTO_WIDTH / 810;

type StampExportCardProps = {
  stamp: Stamp;
  options: StampImageExportOptions;
  onImageReady?: () => void;
  preparedPhoto?: PreparedExportPhoto | null;
};

export function StampExportCard({
  stamp,
  options,
  onImageReady,
  preparedPhoto = null,
}: StampExportCardProps) {
  const [aspectRatio, setAspectRatio] = useState(FALLBACK_ASPECT_RATIO);
  const readyNotifiedRef = useRef(false);
  const labels = resolveFieldLabels({
    ...options,
    ...fieldLabelsFromStamp(stamp),
  });
  const title = formatLabeledValue(
    labels.titleFieldLabel,
    stampDisplayTitle(stamp, options.showDatetime),
  );
  const memo = formatLabeledValue(labels.memoFieldLabel, stamp.memo?.trim() ?? '');
  const place = formatLabeledValue(labels.placeFieldLabel, stampPlaceLine(stamp) ?? '');
  const extra1 = formatLabeledValue(labels.extra1FieldLabel, stamp.extra1?.trim() ?? '');
  const extra2 = formatLabeledValue(labels.extra2FieldLabel, stamp.extra2?.trim() ?? '');
  const coords = stampCoordinatesLine(stamp, options.coordsLabel);
  const watermarkTheme = getWatermarkTheme(options.watermarkStyle);
  const imageUri = resolveImageUri(stamp.imagePath);
  const photoStyle = { width: PHOTO_WIDTH, aspectRatio };

  useEffect(() => {
    if (options.textLayout === 'watermark' && preparedPhoto) {
      return;
    }

    readyNotifiedRef.current = false;
    setAspectRatio(FALLBACK_ASPECT_RATIO);

    let cancelled = false;
    Image.getSize(
      imageUri,
      (width, height) => {
        if (!cancelled && width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {
        // Keep fallback aspect ratio when size lookup fails.
      },
    );

    return () => {
      cancelled = true;
    };
  }, [imageUri, options.textLayout, preparedPhoto]);

  const notifyImageReady = () => {
    if (readyNotifiedRef.current) {
      return;
    }
    readyNotifiedRef.current = true;
    onImageReady?.();
  };

  if (options.textLayout === 'watermark' && preparedPhoto) {
    const scale = preparedPhoto.width / PHOTO_WIDTH;
    const textScale = stampTextSizeScale(options.stampTextSize ?? 'medium');
    const titleSize = Math.max(18, Math.round(32 * scale * textScale));
    const memoSize = Math.max(16, Math.round(26 * scale * textScale));
    const memoLineHeight = Math.max(22, Math.round(34 * scale * textScale));
    const barPaddingX = Math.round(20 * scale);
    const barPaddingY = Math.round(16 * scale);

    return (
      <View
        style={{
          width: preparedPhoto.width,
          height: preparedPhoto.height,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        <Image
          source={{ uri: preparedPhoto.uri }}
          style={{ width: preparedPhoto.width, height: preparedPhoto.height }}
          onLoadEnd={notifyImageReady}
        />
        <WatermarkBarBackground
          style={options.watermarkStyle}
          barStyle={[
            styles.watermarkBar,
            {
              paddingHorizontal: barPaddingX,
              paddingVertical: barPaddingY,
            },
          ]}
        >
          {title ? (
            <Text
              style={[
                styles.watermarkTitle,
                { fontSize: titleSize, textAlign: options.titleAlign, color: watermarkTheme.titleColor },
              ]}
            >
              {title}
            </Text>
          ) : null}
          {place ? (
            <Text
              style={[
                styles.watermarkMemo,
                {
                  fontSize: Math.max(14, Math.round(24 * scale * textScale)),
                  lineHeight: Math.max(18, Math.round(30 * scale * textScale)),
                  textAlign: options.titleAlign,
                  color: watermarkTheme.memoColor,
                },
              ]}
            >
              {place}
            </Text>
          ) : null}
          {extra1 ? (
            <Text
              style={[
                styles.watermarkMemo,
                {
                  fontSize: Math.max(14, Math.round(24 * scale * textScale)),
                  lineHeight: Math.max(18, Math.round(30 * scale * textScale)),
                  textAlign: options.titleAlign,
                  color: watermarkTheme.memoColor,
                },
              ]}
            >
              {extra1}
            </Text>
          ) : null}
          {extra2 ? (
            <Text
              style={[
                styles.watermarkMemo,
                {
                  fontSize: Math.max(14, Math.round(24 * scale * textScale)),
                  lineHeight: Math.max(18, Math.round(30 * scale * textScale)),
                  textAlign: options.titleAlign,
                  color: watermarkTheme.memoColor,
                },
              ]}
            >
              {extra2}
            </Text>
          ) : null}
          {memo ? (
            <Text
              style={[
                styles.watermarkMemo,
                {
                  fontSize: memoSize,
                  lineHeight: memoLineHeight,
                  textAlign: options.memoAlign,
                  color: watermarkTheme.memoColor,
                },
              ]}
            >
              {memo}
            </Text>
          ) : null}
          {coords ? (
            <Text
              style={[
                styles.watermarkCoords,
                {
                  fontSize: Math.max(14, Math.round(22 * scale * textScale)),
                  lineHeight: Math.max(18, Math.round(28 * scale * textScale)),
                  textAlign: options.memoAlign,
                  color: watermarkTheme.coordsColor,
                },
              ]}
            >
              {coords}
            </Text>
          ) : null}
        </WatermarkBarBackground>
      </View>
    );
  }

  if (options.textLayout === 'watermark') {
    return (
      <View style={styles.card}>
        <View style={[styles.photoWrap, { width: PHOTO_WIDTH }]}>
          <Image
            source={{ uri: imageUri }}
            style={photoStyle}
            resizeMode="cover"
            onLoadEnd={notifyImageReady}
          />
          <WatermarkBarBackground style={options.watermarkStyle} barStyle={styles.watermarkBar}>
            {title ? (
              <Text
                style={[
                  styles.watermarkTitle,
                  { textAlign: options.titleAlign, color: watermarkTheme.titleColor },
                ]}
              >
                {title}
              </Text>
            ) : null}
            {place ? (
              <Text
                style={[
                  styles.watermarkMemo,
                  { textAlign: options.titleAlign, color: watermarkTheme.memoColor },
                ]}
              >
                {place}
              </Text>
            ) : null}
            {extra1 ? (
              <Text
                style={[
                  styles.watermarkMemo,
                  { textAlign: options.titleAlign, color: watermarkTheme.memoColor },
                ]}
              >
                {extra1}
              </Text>
            ) : null}
            {extra2 ? (
              <Text
                style={[
                  styles.watermarkMemo,
                  { textAlign: options.titleAlign, color: watermarkTheme.memoColor },
                ]}
              >
                {extra2}
              </Text>
            ) : null}
            {memo ? (
              <Text
                style={[
                  styles.watermarkMemo,
                  { textAlign: options.memoAlign, color: watermarkTheme.memoColor },
                ]}
              >
                {memo}
              </Text>
            ) : null}
            {coords ? (
              <Text
                style={[
                  styles.watermarkCoords,
                  { textAlign: options.memoAlign, color: watermarkTheme.coordsColor },
                ]}
              >
                {coords}
              </Text>
            ) : null}
          </WatermarkBarBackground>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: imageUri }}
        style={photoStyle}
        resizeMode="contain"
        onLoadEnd={notifyImageReady}
      />
      {(() => {
        const labels = resolveFieldLabels(options);
        const orgName =
          options.showOrgName && options.orgName?.trim() ? options.orgName.trim() : null;
        const footerPhrase =
          options.showFooterPhrase && options.footerPhrase?.trim()
            ? options.footerPhrase.trim()
            : null;
        const rows = buildCaptionTableRows(stamp, labels, {
          showDatetime: options.showDatetime,
          coordsLabel: options.coordsLabel,
          includeCoords: true,
        });
        const textScale = stampTextSizeScale(options.stampTextSize ?? 'medium');
        const fs = (n: number) => Math.max(12, Math.round(n * textScale));
        return (
          <View style={styles.captionBlock}>
            {orgName ? (
              <Text style={[styles.captionOrg, { textAlign: options.titleAlign, fontSize: fs(28) }]}>
                {orgName}
              </Text>
            ) : null}
            {rows.length > 0 ? (
              <View style={styles.captionTable}>
                {rows.map((row) => (
                  <View key={`${row.label}:${row.value}`} style={styles.captionTableRow}>
                    <Text style={[styles.captionTableLabel, { fontSize: fs(24) }]}>{row.label}</Text>
                    <Text
                      style={[
                        styles.captionTableValue,
                        { textAlign: options.memoAlign, fontSize: fs(24) },
                      ]}
                    >
                      {row.value}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
            {footerPhrase ? (
              <Text
                style={[
                  styles.captionPhrase,
                  { textAlign: options.memoAlign, fontSize: fs(22) },
                ]}
              >
                {footerPhrase}
              </Text>
            ) : null}
          </View>
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: STAMP_EXPORT_CARD_WIDTH,
    backgroundColor: '#fff',
    padding: 24,
  },
  photoWrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  watermarkTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  watermarkMemo: {
    marginTop: 8,
    fontSize: 26,
    color: '#f3f4f6',
    lineHeight: 34,
  },
  watermarkCoords: {
    marginTop: 6,
    fontSize: 22,
    color: '#e5e7eb',
    lineHeight: 28,
  },
  title: {
    marginTop: 16,
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
  },
  captionBlock: {
    marginTop: 16,
    gap: 10,
  },
  captionOrg: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  captionTable: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
  },
  captionTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  captionTableLabel: {
    width: '28%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  captionTableValue: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 24,
    color: '#374151',
    lineHeight: 32,
  },
  captionPhrase: {
    fontSize: 22,
    color: '#6b7280',
  },
  memo: {
    marginTop: 12,
    fontSize: 28,
    color: '#374151',
    lineHeight: 38,
  },
  coords: {
    marginTop: 8,
    fontSize: 24,
    color: '#6b7280',
    lineHeight: 32,
  },
});
