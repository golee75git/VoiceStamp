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
  selected?: boolean;
  /** When true (list select mode), keep original file URI only — no thumb swap (Android white cells). */
  lockOriginal?: boolean;
};

/**
 * 목록·휴지통 카드용.
 * 평소: 원본 → 디스크 썸네일. 선택 모드(lockOriginal): 원본만 유지.
 */
export function StampListThumb({
  id,
  imagePath,
  style,
  selected = false,
  lockOriginal = false,
}: StampListThumbProps) {
  const fullUri = resolveImageUri(imagePath);
  const [uri, setUri] = useState(fullUri);

  useEffect(() => {
    let cancelled = false;
    setUri(fullUri);

    if (lockOriginal || Platform.OS === 'web' || !id) {
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

  const displayUri = lockOriginal ? fullUri : uri;

  return (
    <Image
      key={`${id}:sel-${selected ? 1 : 0}:lock-${lockOriginal ? 1 : 0}`}
      source={{ uri: displayUri }}
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
