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
};

/**
 * 목록·휴지통 카드용.
 * 항상 원본 URI로 먼저 그린 뒤, 디스크 썸네일이 있을 때만 교체한다.
 * (없는 thumbs/ 경로를 먼저 넣으면 Android에서 하얀 칸이 남음)
 */
export function StampListThumb({ id, imagePath, style }: StampListThumbProps) {
  const fullUri = resolveImageUri(imagePath);
  const [uri, setUri] = useState(fullUri);

  useEffect(() => {
    let cancelled = false;
    setUri(fullUri);

    (async () => {
      if (Platform.OS === 'web' || !id) {
        return;
      }
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
  }, [id, imagePath, fullUri]);

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
