import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

import { resolveImageUri } from '../services/fileService';
import { ensureStampThumb, resolveStampThumbUri } from '../services/stampThumb';

type StampListThumbProps = {
  id: string;
  imagePath: string;
  style?: StyleProp<ImageStyle>;
};

function initialListUri(id: string, fullUri: string): string {
  if (Platform.OS === 'web' || !id) {
    return fullUri;
  }
  // Prefer known thumb path immediately so remount (select/deselect) is not blank.
  return resolveStampThumbUri(id) || fullUri;
}

/**
 * 목록·휴지통 카드용. 디스크 썸네일 우선, 없으면 생성 후 표시.
 * 리마운트·선택 해제 시에도 원본/썸네일 경로를 바로 넣어 빈 칸을 막는다.
 */
export function StampListThumb({ id, imagePath, style }: StampListThumbProps) {
  const fullUri = resolveImageUri(imagePath);
  const [uri, setUri] = useState(() => initialListUri(id, fullUri));
  const [gen, setGen] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const boot = initialListUri(id, fullUri);
    setUri(boot);
    (async () => {
      try {
        const thumbUri = await ensureStampThumb(id, fullUri);
        if (cancelled) return;
        setUri(thumbUri);
        setGen((n) => n + 1);
      } catch {
        if (!cancelled) {
          setUri(fullUri);
          setGen((n) => n + 1);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, imagePath, fullUri]);

  return (
    <Image
      key={`${id}:${gen}:${uri}`}
      source={{ uri }}
      style={[styles.thumb, style]}
      onError={() => {
        if (uri !== fullUri) {
          setUri(fullUri);
          setGen((n) => n + 1);
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
