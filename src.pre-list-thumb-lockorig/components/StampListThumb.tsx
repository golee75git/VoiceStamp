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
  /** Selection chrome change remounts Image on Android (avoids white cells mid-unselect). */
  selected?: boolean;
};

/**
 * 목록·휴지통 카드용.
 * 항상 원본 URI로 먼저 그린 뒤, 디스크 썸네일이 있을 때만 교체한다.
 * selected 토글 시 Image만 다시 마운트해 선택 해제 중 하얀 칸을 막는다.
 */
export function StampListThumb({ id, imagePath, style, selected = false }: StampListThumbProps) {
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
  }, [id, imagePath, fullUri, selected]);

  return (
    <Image
      key={`${id}:sel-${selected ? 1 : 0}`}
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
