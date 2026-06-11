import { Image, StyleSheet, Text, View } from 'react-native';

import { resolveImageUri } from '../services/fileService';
import { pdfDisplayTitle } from '../services/pdfTitleFormat';
import type { StampImageExportOptions } from '../services/exportStampImage';
import type { Stamp } from '../types/stamp';

export const STAMP_EXPORT_CARD_WIDTH = 1080;

type StampExportCardProps = {
  stamp: Stamp;
  options: StampImageExportOptions;
};

export function StampExportCard({ stamp, options }: StampExportCardProps) {
  const title = pdfDisplayTitle(stamp.title, options.showDatetime);
  const memo = stamp.memo?.trim() ?? '';
  const photoWidth = STAMP_EXPORT_CARD_WIDTH - 48;

  if (options.textLayout === 'watermark') {
    return (
      <View style={styles.card}>
        <View style={[styles.photoWrap, { width: photoWidth }]}>
          <Image
            source={{ uri: resolveImageUri(stamp.imagePath) }}
            style={[styles.photo, { width: photoWidth }]}
            resizeMode="cover"
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
        source={{ uri: resolveImageUri(stamp.imagePath) }}
        style={styles.photo}
        resizeMode="contain"
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
    backgroundColor: '#f3f4f6',
  },
  photo: {
    width: STAMP_EXPORT_CARD_WIDTH - 48,
    height: 810,
    backgroundColor: '#f3f4f6',
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
