import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

import { resolveImageUri } from '../services/fileService';
import {
  ensureStampThumb,
  resolveStampThumbUri,
  stampThumbExists,
} from '../services/stampThumb';

type StampListThumbProps = {
  id: string;
  imagePath: string;
  style?: StyleProp<ImageStyle>;
  /**
   * Select mode: do not swap URI / remount Image.
   * Keeps whatever is already painted so check toggles do not blank Android images.
   */
  lockOriginal?: boolean;
};

/**
 * 목록·휴지통 카드용.
 * 평소: 원본 → 디스크 썸네일.
 * 선택 모드: 이미 그려진 URI를 유지(토글해도 Image 인스턴스·source 고정).
 */
export function StampListThumb({
  id,
  imagePath,
  style,
  lockOriginal = false,
}: StampListThumbProps) {
  const fullUri = resolveImageUri(imagePath);
  const [uri, setUri] = useState(fullUri);

  useEffect(() => {
    let cancelled = false;

    if (lockOriginal) {
      // Keep painted bitmap; only fill if somehow empty.
      setUri((prev) => prev || fullUri);
      return () => {
        cancelled = true;
      };
    }

    setUri(fullUri);
    if (Platform.OS === 'web' || !id) {
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const hasThumb = await stampThumbExists(id);
        if (cancelled) return;
        if (hasThumb) {
          setUri(resolveStampThumbUri(id));
          return;
        }
        const thumbUri = await ensureStampThumb(id, fullUri);
        if (!cancelled) {
          setUri(thumbUri);
        }
      } catch {
        if (!cancelled) {
          setUri(fullUri);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, imagePath, fullUri, lockOriginal]);

  return (
    <Image
      source={{ uri }}
      style={[styles.thumb, style]}
      onError={() => {
        if (uri !== fullUri) {
          setUri(fullUri);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  thumb: {
    backgroundColor: '#e5e7eb',
  },
});
