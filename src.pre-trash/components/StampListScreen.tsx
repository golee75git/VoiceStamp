import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { StampSaveModal } from './StampSaveModal';
import { createStampsPdf, savePdf, sharePdf } from '../services/exportPdf';
import { listStamps } from '../services/stampRepository';
import { resolveImageUri } from '../services/fileService';
import type { Stamp } from '../types/stamp';

type StampListScreenProps = {
  onBack: () => void;
  onOpenSettings: () => void;
  refreshKey: number;
};

export function StampListScreen({ onBack, onOpenSettings, refreshKey }: StampListScreenProps) {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStamp, setEditingStamp] = useState<Stamp | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('VoiceStamp');
  const [pdfBusy, setPdfBusy] = useState(false);

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

  useEffect(() => {
    if (!selecting || selectedIds.size === 0) {
      return;
    }

    const selected = stamps.filter((s) => selectedIds.has(s.id));
    const defaultName = selected[0]?.title?.trim() || 'VoiceStamp';
    setPdfFileName(defaultName);
  }, [selectedIds, stamps, selecting]);

  const exitSelection = () => {
    setSelecting(false);
    setSelectedIds(new Set());
    setPdfUri(null);
    setPdfFileName('VoiceStamp');
  };

  const toggleSelect = (id: string) => {
    setPdfUri(null);
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

  const getSelectedStamps = () => stamps.filter((s) => selectedIds.has(s.id));

  const handleCardPress = (item: Stamp) => {
    if (selecting) {
      toggleSelect(item.id);
    } else {
      setEditingStamp(item);
    }
  };

  const handleCardLongPress = (item: Stamp) => {
    if (!selecting) {
      setSelecting(true);
      setPdfUri(null);
      setSelectedIds(new Set([item.id]));
      return;
    }
    toggleSelect(item.id);
  };

  const handleCreatePdf = async () => {
    const selected = getSelectedStamps();
    if (selected.length === 0) return;

    setPdfBusy(true);
    try {
      const uri = await createStampsPdf(selected, pdfFileName);
      setPdfUri(uri);
      Alert.alert('PDF 생성 완료', '저장 또는 공유 버튼을 눌러주세요.');
    } catch (e) {
      Alert.alert(
        'PDF 생성 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSavePdf = async () => {
    if (!pdfUri) return;

    setPdfBusy(true);
    try {
      await savePdf(pdfUri, pdfFileName);
    } catch (e) {
      Alert.alert(
        'PDF 저장 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSharePdf = async () => {
    if (!pdfUri) return;

    setPdfBusy(true);
    try {
      await sharePdf(pdfUri, pdfFileName);
    } catch (e) {
      Alert.alert(
        'PDF 공유 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setPdfBusy(false);
    }
  };

  const selectedCount = selectedIds.size;
  const { width } = useWindowDimensions();
  const numColumns = width >= 600 ? 2 : 1;
  const isGrid = numColumns > 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.backText}>← 카메라</Text>
        </Pressable>
        <View style={styles.headerRow}>
          <Text style={styles.title}>저장 목록</Text>
          {selecting ? (
            <Pressable onPress={exitSelection}>
              <Text style={styles.actionText}>취소</Text>
            </Pressable>
          ) : (
            stamps.length > 0 && (
              <Pressable onPress={() => setSelecting(true)}>
                <Text style={styles.actionText}>선택</Text>
              </Pressable>
            )
          )}
        </View>
        {selecting && selectedCount > 0 && (
          <View style={styles.pdfBar}>
            <Pressable
              style={styles.pdfBarButton}
              onPress={handleCreatePdf}
              disabled={pdfBusy}
            >
              {pdfBusy && !pdfUri ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text style={styles.pdfBarButtonText}>PDF 만들기</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.pdfBarButton, !pdfUri && styles.pdfBarButtonDisabled]}
              onPress={handleSavePdf}
              disabled={!pdfUri || pdfBusy}
            >
              <Text
                style={[
                  styles.pdfBarButtonText,
                  !pdfUri && styles.pdfBarButtonTextDisabled,
                ]}
              >
                저장
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.pdfBarButtonPrimary,
                !pdfUri && styles.pdfBarButtonDisabled,
              ]}
              onPress={handleSharePdf}
              disabled={!pdfUri || pdfBusy}
            >
              <Text
                style={[
                  styles.pdfBarButtonPrimaryText,
                  !pdfUri && styles.pdfBarButtonTextDisabled,
                ]}
              >
                공유
              </Text>
            </Pressable>
          </View>
        )}
        {selecting && selectedCount > 0 && (
          <View style={styles.pdfNameRow}>
            <Text style={styles.pdfNameLabel}>PDF 파일명</Text>
            <TextInput
              style={styles.pdfNameInput}
              value={pdfFileName}
              onChangeText={setPdfFileName}
              placeholder="VoiceStamp"
              editable={!pdfBusy}
            />
          </View>
        )}
      </View>

      <View style={styles.listArea}>
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
            key={numColumns}
            data={stamps}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            columnWrapperStyle={isGrid ? styles.columnWrapper : undefined}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <Pressable
                  style={[
                    styles.card,
                    isGrid && styles.cardGrid,
                    selecting && isSelected && styles.cardSelected,
                  ]}
                  onPress={() => handleCardPress(item)}
                  onLongPress={() => handleCardLongPress(item)}
                  delayLongPress={400}
                >
                  {selecting && (
                    <View style={isGrid ? styles.checkboxGrid : styles.checkbox}>
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
                      {new Date(item.createdAt).toLocaleString('ko-KR')}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      <Pressable style={styles.settingsFooter} onPress={onOpenSettings}>
        <Text style={styles.settingsFooterText}>설정</Text>
      </Pressable>

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
  pdfBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  pdfBarButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pdfBarButtonPrimary: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pdfBarButtonDisabled: {
    opacity: 0.45,
  },
  pdfBarButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  pdfBarButtonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pdfBarButtonTextDisabled: {
    color: '#9ca3af',
  },
  pdfNameRow: {
    gap: 4,
    marginTop: 4,
  },
  pdfNameLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  pdfNameInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#111',
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
  listArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
  },
  settingsFooterText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 16,
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
  cardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  checkbox: {
    paddingLeft: 12,
    justifyContent: 'center',
  },
  checkboxGrid: {
    padding: 8,
    alignSelf: 'flex-start',
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
});
