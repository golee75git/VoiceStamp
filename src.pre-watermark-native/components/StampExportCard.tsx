import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { resolveImageUri } from '../services/fileService';
import type { PreparedExportPhoto } from '../services/exportStampImage';
import { pdfDisplayTitle } from '../services/pdfTitleFormat';
import type { StampImageExportOptions } from '../services/exportStampImage';
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
  const title = pdfDisplayTitle(stamp.title, options.showDatetime);
  const memo = stamp.memo?.trim() ?? '';
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
    const titleSize = Math.max(18, Math.round(32 * scale));
    const memoSize = Math.max(16, Math.round(26 * scale));
    const memoLineHeight = Math.max(22, Math.round(34 * scale));
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
        <View
          style={[
            styles.watermarkBar,
            {
              paddingHorizontal: barPaddingX,
              paddingVertical: barPaddingY,
            },
          ]}
        >
          <Text
            style={[
              styles.watermarkTitle,
              { fontSize: titleSize, textAlign: options.titleAlign },
            ]}
          >
            {title}
          </Text>
          {memo ? (
            <Text
              style={[
                styles.watermarkMemo,
                {
                  fontSize: memoSize,
                  lineHeight: memoLineHeight,
                  textAlign: options.memoAlign,
                },
              ]}
            >
              {memo}
            </Text>
          ) : null}
        </View>
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
          <View style={styles.watermarkBar}>
            <Text style={[styles.watermarkTitle, { textAlign: options.titleAlign }]}>{title}</Text>
            {memo ? (
              <Text style={[styles.watermarkMemo, { textAlign: options.memoAlign }]}>{memo}</Text>
            ) : null}
          </View>
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
      <Text style={[styles.title, { textAlign: options.titleAlign }]}>{title}</Text>
      {memo ? (
        <Text style={[styles.memo, { textAlign: options.memoAlign }]}>{memo}</Text>
      ) : null}
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
  title: {
    marginTop: 16,
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
  },
  memo: {
    marginTop: 12,
    fontSize: 28,
    color: '#374151',
    lineHeight: 38,
  },
});
