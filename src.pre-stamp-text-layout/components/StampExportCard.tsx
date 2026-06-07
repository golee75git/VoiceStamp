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
  photo: {
    width: STAMP_EXPORT_CARD_WIDTH - 48,
    height: 810,
    backgroundColor: '#f3f4f6',
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
