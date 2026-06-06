import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StampSaveModal } from './StampSaveModal';
import { exportStampsToPdf } from '../services/exportPdf';
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
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

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

  const exitSelection = () => {
    setSelecting(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCardPress = (item: Stamp) => {
    if (selecting) {
      toggleSelect(item.id);
    } else {
      setEditingStamp(item);
    }
  };

  const handleExportPdf = async () => {
    const selected = stamps.filter((s) => selectedIds.has(s.id));
    if (selected.length === 0) return;

    setExporting(true);
    try {
      await exportStampsToPdf(selected);
      exitSelection();
    } catch (e) {
      Alert.alert(
        'PDF보내기 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setExporting(false);
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.backText}>← 카메라</Text>
        </Pressable>
        <View style={styles.headerRow}>
          <Text style={styles.title}>저장 목록</Text>
          {selecting ? (
            <View style={styles.headerActions}>
              <Pressable onPress={exitSelection}>
                <Text style={styles.actionText}>취소</Text>
              </Pressable>
              {selectedCount > 0 && (
                <Pressable
                  style={styles.pdfButton}
                  onPress={handleExportPdf}
                  disabled={exporting}
                >
                  {exporting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.pdfButtonText}>
                      PDF 만들기 ({selectedCount})
                    </Text>
                  )}
                </Pressable>
              )}
            </View>
          ) : (
            stamps.length > 0 && (
              <Pressable onPress={() => setSelecting(true)}>
                <Text style={styles.actionText}>선택</Text>
              </Pressable>
            )
          )}
        </View>
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
          renderItem={({ item }) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <Pressable
                style={[styles.card, selecting && isSelected && styles.cardSelected]}
                onPress={() => handleCardPress(item)}
              >
                {selecting && (
                  <View style={styles.checkbox}>
                    <View
                      style={[
                        styles.checkboxInner,
                        isSelected && styles.checkboxChecked,
                      ]}
                    >
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </View>
                )}
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
            );
          }}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    flex: 1,
  },
  actionText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
  pdfButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  checkbox: {
    paddingLeft: 12,
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
