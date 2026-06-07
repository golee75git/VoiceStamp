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
import { defaultPdfFileNameFromStampTitle } from '../services/pdfTitleFormat';
import { pickImageFromLibrary } from '../services/pickStampImage';
import {
  getMemoTextAlign,
  getPdfFilenameIncludeDatetime,
  getTitleTextAlign,
  type TextAlign,
} from '../services/settingsService';
import { listStamps } from '../services/stampRepository';
import { moveStampsToTrash } from '../services/stampTrash';
import { resolveImageUri } from '../services/fileService';
import type { Stamp } from '../types/stamp';

type StampListScreenProps = {
  onBack: () => void;
  onOpenTrash: () => void;
  refreshKey: number;
  onChanged: () => void;
};

export function StampListScreen({
  onBack,
  onOpenTrash,
  refreshKey,
  onChanged,
}: StampListScreenProps) {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStamp, setEditingStamp] = useState<Stamp | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('VoiceStamp');
  const [pdfReportTitle, setPdfReportTitle] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [titleTextAlign, setTitleTextAlign] = useState<TextAlign>('left');
  const [memoTextAlign, setMemoTextAlign] = useState<TextAlign>('left');
  const [pdfFilenameIncludeDatetime, setPdfFilenameIncludeDatetime] = useState(true);
  const [importUri, setImportUri] = useState<string | null>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [albumBusy, setAlbumBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rows, titleAlign, memoAlign, filenameDatetime] = await Promise.all([
        listStamps(),
        getTitleTextAlign(),
        getMemoTextAlign(),
        getPdfFilenameIncludeDatetime(),
      ]);
      setStamps(rows);
      setTitleTextAlign(titleAlign);
      setMemoTextAlign(memoAlign);
      setPdfFilenameIncludeDatetime(filenameDatetime);
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
    const defaultName = defaultPdfFileNameFromStampTitle(
      selected[0]?.title,
      pdfFilenameIncludeDatetime,
    );
    setPdfFileName(defaultName);
    setPdfReportTitle(defaultName);
  }, [selectedIds, stamps, selecting, pdfFilenameIncludeDatetime]);

  const exitSelection = () => {
    setSelecting(false);
    setSelectedIds(new Set());
    setPdfUri(null);
    setPdfFileName('VoiceStamp');
    setPdfReportTitle('');
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
      const uri = await createStampsPdf(selected, pdfFileName, pdfReportTitle);
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

  const handlePickFromLibrary = async () => {
    if (albumBusy || selecting) {
      return;
    }

    setAlbumBusy(true);
    try {
      const uri = await pickImageFromLibrary();
      if (uri) {
        setImportUri(uri);
        setImportModalVisible(true);
      }
    } catch (e) {
      Alert.alert(
        '앨범',
        e instanceof Error ? e.message : '앨범에서 선택하지 못했습니다.',
      );
    } finally {
      setAlbumBusy(false);
    }
  };

  const handleDeleteSelected = () => {
    const selected = getSelectedStamps();
    if (selected.length === 0) {
      return;
    }

    Alert.alert(
      '휴지통으로 이동',
      `선택한 ${selected.length}개 스탬프를 휴지통으로 옮깁니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setDeleteBusy(true);
            try {
              const moved = await moveStampsToTrash([...selectedIds]);
              if (moved === 0) {
                Alert.alert('삭제 실패', '스탬프를 찾을 수 없습니다.');
                return;
              }
              onChanged();
              await load();
              exitSelection();
            } catch (e) {
              Alert.alert(
                '삭제 실패',
                e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
              );
            } finally {
              setDeleteBusy(false);
            }
          },
        },
      ],
    );
  };

  const selectedCount = selectedIds.size;
  const { width } = useWindowDimensions();
  const numColumns = width >= 600 ? 2 : 1;
  const isGrid = numColumns > 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>← 카메라</Text>
        </Pressable>
        <Pressable
          style={[styles.albumNavButton, albumBusy && styles.albumNavButtonDisabled]}
          onPress={handlePickFromLibrary}
          disabled={albumBusy || selecting}
        >
          {albumBusy ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Text style={styles.albumNavText}>앨범</Text>
          )}
        </Pressable>
        <View style={styles.headerRow}>
          <Text style={styles.title}>저장 목록</Text>
          <View style={styles.headerActions}>
            {!selecting && (
              <Pressable onPress={onOpenTrash}>
                <Text style={styles.actionText}>휴지통</Text>
              </Pressable>
            )}
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
            <Text style={[styles.pdfNameLabel, styles.pdfReportTitleLabel]}>보고서 제목</Text>
            <TextInput
              style={styles.pdfNameInput}
              value={pdfReportTitle}
              onChangeText={setPdfReportTitle}
              placeholder="1페이지 상단 제목 (비우면 표시 안 함)"
              editable={!pdfBusy}
            />
          </View>
        )}
        {selecting && selectedCount > 0 && (
          <Pressable
            style={[styles.deleteButton, (pdfBusy || deleteBusy) && styles.pdfBarButtonDisabled]}
            onPress={handleDeleteSelected}
            disabled={pdfBusy || deleteBusy}
          >
            {deleteBusy ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>휴지통으로 이동 ({selectedCount})</Text>
            )}
          </Pressable>
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
                    <Text style={[styles.cardTitle, { textAlign: titleTextAlign }]} numberOfLines={1}>
                      {item.title || '(제목 없음)'}
                    </Text>
                    <Text
                      style={[styles.cardMemo, { textAlign: memoTextAlign }]}
                      numberOfLines={isGrid ? 3 : 2}
                    >
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

      <StampSaveModal
        visible={editingStamp != null}
        stamp={editingStamp}
        imageUri={editingStamp ? resolveImageUri(editingStamp.imagePath) : null}
        onClose={() => setEditingStamp(null)}
        onSaved={load}
      />

      <StampSaveModal
        visible={importModalVisible}
        imageUri={importUri}
        onClose={() => {
          setImportModalVisible(false);
          setImportUri(null);
        }}
        onSaved={() => {
          onChanged();
          load();
        }}
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
    gap: 14,
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
  pdfReportTitleLabel: {
    marginTop: 8,
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
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  backText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 17,
  },
  albumNavButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  albumNavButtonDisabled: {
    opacity: 0.6,
  },
  albumNavText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 17,
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
