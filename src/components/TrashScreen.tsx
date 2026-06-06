import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { resolveImageUri } from '../services/fileService';
import { listTrashedStamps } from '../services/stampRepository';
import { restoreStampFromTrash } from '../services/stampTrash';
import type { Stamp } from '../types/stamp';

type TrashScreenProps = {
  onBack: () => void;
  refreshKey: number;
  onChanged: () => void;
};

export function TrashScreen({ onBack, refreshKey, onChanged }: TrashScreenProps) {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listTrashedStamps();
      setStamps(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleRestore = async (stamp: Stamp) => {
    setBusyId(stamp.id);
    try {
      const restored = await restoreStampFromTrash(stamp.id);
      if (!restored) {
        Alert.alert('복원 실패', '스탬프를 찾을 수 없습니다.');
        return;
      }
      onChanged();
      await load();
    } catch (e) {
      Alert.alert(
        '복원 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setBusyId(null);
    }
  };

  const { width } = useWindowDimensions();
  const numColumns = width >= 600 ? 2 : 1;
  const isGrid = numColumns > 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.backText}>← 목록</Text>
        </Pressable>
        <Text style={styles.title}>휴지통</Text>
        <Text style={styles.hint}>항목을 누르면 목록으로 복원합니다. 영구 삭제는 설정에서 비울 수 있습니다.</Text>
      </View>

      <View style={styles.listArea}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
          </View>
        ) : stamps.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.empty}>휴지통이 비어 있습니다.</Text>
          </View>
        ) : (
          <FlatList
            key={numColumns}
            data={stamps}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            columnWrapperStyle={isGrid ? styles.columnWrapper : undefined}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, isGrid && styles.cardGrid]}
                onPress={() => handleRestore(item)}
                disabled={busyId === item.id}
              >
                <Image
                  source={{ uri: resolveImageUri(item.imagePath) }}
                  style={isGrid ? styles.thumbnailGrid : styles.thumbnail}
                />
                <View style={styles.meta}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title || '(제목 없음)'}
                  </Text>
                  <Text style={styles.cardMemo} numberOfLines={isGrid ? 3 : 2}>
                    {item.memo || '(메모 없음)'}
                  </Text>
                  <Text style={styles.cardDate}>
                    삭제:{' '}
                    {item.deletedAt
                      ? new Date(item.deletedAt).toLocaleString('ko-KR')
                      : '-'}
                  </Text>
                </View>
                {busyId === item.id ? (
                  <ActivityIndicator style={styles.busy} size="small" color="#2563eb" />
                ) : null}
              </Pressable>
            )}
          />
        )}
      </View>
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
  hint: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  listArea: {
    flex: 1,
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
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    alignItems: 'center',
  },
  cardGrid: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 0,
  },
  thumbnail: {
    width: 96,
    height: 96,
    backgroundColor: '#e5e7eb',
  },
  thumbnailGrid: {
    width: '100%',
    height: 140,
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
  busy: {
    marginRight: 12,
  },
});
