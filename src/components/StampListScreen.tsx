import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StampSaveModal } from './StampSaveModal';
import { listStamps } from '../services/stampRepository';
import { resolveImageUri } from '../services/fileService';
import type { Stamp } from '../types/stamp';

type StampListScreenProps = {
  onBack: () => void;
  refreshKey: number;
};

export function StampListScreen({ onBack, refreshKey }: StampListScreenProps) {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStamp, setEditingStamp] = useState<Stamp | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listStamps();
      setStamps(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.backText}>← 카메라</Text>
        </Pressable>
        <Text style={styles.title}>저장 목록</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : stamps.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>저장된 스탬프가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={stamps}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => setEditingStamp(item)}>
              <Image
                source={{ uri: resolveImageUri(item.imagePath) }}
                style={styles.thumbnail}
              />
              <View style={styles.meta}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title || '(제목 없음)'}
                </Text>
                <Text style={styles.cardMemo} numberOfLines={2}>
                  {item.memo || '(메모 없음)'}
                </Text>
                <Text style={styles.cardDate}>
                  {new Date(item.createdAt).toLocaleString('ko-KR')}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <StampSaveModal
        visible={editingStamp != null}
        stamp={editingStamp}
        imageUri={editingStamp ? resolveImageUri(editingStamp.imagePath) : null}
        onClose={() => setEditingStamp(null)}
        onSaved={load}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  backText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: '#6b7280',
    fontSize: 15,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  thumbnail: {
    width: 96,
    height: 96,
    backgroundColor: '#e5e7eb',
  },
  meta: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  cardMemo: {
    fontSize: 14,
    color: '#4b5563',
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});
