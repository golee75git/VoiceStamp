import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { resolveImageUri } from '../services/fileService';
import { listFollowLinkChain } from '../services/stampRepository';
import type { Stamp } from '../types/stamp';

type FollowLinkCompareSheetProps = {
  visible: boolean;
  anchor: Stamp | null;
  onClose: () => void;
};

export function FollowLinkCompareSheet({
  visible,
  anchor,
  onClose,
}: FollowLinkCompareSheetProps) {
  const [loading, setLoading] = useState(false);
  const [chain, setChain] = useState<Stamp[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !anchor) {
      setChain([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void listFollowLinkChain(anchor)
      .then((rows) => {
        if (!cancelled) {
          setChain(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('연결 기록을 불러오지 못했습니다.');
          setChain([anchor]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [visible, anchor?.id]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>연결 비교</Text>
          <Text style={styles.hint}>
            원본과 후속 스탬프를 나란히 봅니다. 각 항목은 목록에서 따로 수정할 수 있습니다.
          </Text>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color="#2563eb" />
            </View>
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              contentContainerStyle={styles.row}
            >
              {chain.map((item, index) => {
                const label = index === 0 ? '원본' : `후속 ${index}`;
                return (
                  <View key={item.id} style={styles.card}>
                    <Text style={styles.cardLabel}>{label}</Text>
                    <Image
                      source={{ uri: resolveImageUri(item.imagePath) }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title.trim() || '(제목 없음)'}
                    </Text>
                    <Text style={styles.cardDate}>
                      {new Date(item.createdAt).toLocaleString('ko-KR')}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}
          {!loading && chain.length < 2 ? (
            <Text style={styles.emptyHint}>아직 연결된 후속 스탬프가 없습니다.</Text>
          ) : null}
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="연결 비교 닫기"
          >
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'android' ? 32 : 24,
    gap: 12,
    maxHeight: '88%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  hint: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  centered: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    gap: 12,
    paddingVertical: 4,
    paddingRight: 8,
  },
  card: {
    width: 220,
    gap: 6,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyHint: {
    fontSize: 13,
    color: '#6b7280',
  },
  error: {
    fontSize: 14,
    color: '#b91c1c',
  },
  closeButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: '#111827',
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
