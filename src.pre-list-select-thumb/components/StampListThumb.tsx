import { useEffect, useState } from 'react';
import { Image, StyleSheet, View, type ImageStyle, type StyleProp } from 'react-native';

import { resolveImageUri } from '../services/fileService';
import { ensureStampThumb } from '../services/stampThumb';

type StampListThumbProps = {
  id: string;
  imagePath: string;
  style?: StyleProp<ImageStyle>;
};

/**
 * 목록·휴지통 카드용. 디스크 썸네일 우선, 없으면 생성 후 표시.
 * 생성 전/실패 시 플레이스홀더 → 원본 폴백.
 * 재조회 중에는 기존 URI를 비우지 않아 선택 취소·레이아웃 변경 시 흰 칸을 줄인다.
 */
export function StampListThumb({ id, imagePath, style }: StampListThumbProps) {
  const fullUri = resolveImageUri(imagePath);
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
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

  if (!uri) {
    return <View style={[styles.placeholder, style]} />;
  }

  return <Image source={{ uri }} style={style} />;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#e5e7eb',
  },
});
