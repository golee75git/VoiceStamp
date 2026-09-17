import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { confirmAlert } from '../utils/confirmAlert';
import { resolveImageUri } from '../services/fileService';
import { loadStampPdfExport, loadStampXlsxExport } from '../services/exportOnDemand';
import { defaultPdfFileNameFromStampTitle } from '../services/pdfTitleFormat';
import {
  DEFAULT_INBOX_EXCEL_FONT_SIZE,
  DEFAULT_INBOX_EXCEL_PREVIEW_WIDTH,
  MAX_INBOX_EXCEL_PREVIEW_WIDTH,
  MIN_INBOX_EXCEL_PREVIEW_WIDTH,
  getInboxExcelFontSize,
  getInboxExcelPreviewWidth,
  inboxExcelFontSizeToPt,
  sanitizeInboxExcelFontSize,
  sanitizeInboxExcelPreviewWidth,
  setInboxExcelFontSize,
  setInboxExcelPreviewWidth,
  type InboxExcelFontSize,
} from '../services/projectCollectSettings';
import { listFollowLinkChain, resolveFollowRootId } from '../services/stampRepository';
import { moveStampsToTrash } from '../services/stampTrash';
import type { Stamp } from '../types/stamp';

/** Same chips as list/inbox Excel. FOLLOW_XLSX_PHOTO_PX */
const FOLLOW_XLSX_PX_PRESETS = [180, 240, 320, 480, 800] as const;

type FollowLinkCompareSheetProps = {
  visible: boolean;
  anchor: Stamp | null;
  onClose: () => void;
  /** After trash — parent should refresh list. */
  onChanged?: () => void;
};

export function FollowLinkCompareSheet({
  visible,
  anchor,
  onClose,
  onChanged,
}: FollowLinkCompareSheetProps) {
  const [loading, setLoading] = useState(false);
  const [chain, setChain] = useState<Stamp[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('VoiceStamp');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [xlsxBusy, setXlsxBusy] = useState(false);
  const [xlsxPxVisible, setXlsxPxVisible] = useState(false);
  const [xlsxPxText, setXlsxPxText] = useState(String(DEFAULT_INBOX_EXCEL_PREVIEW_WIDTH));
  const [xlsxFontSize, setXlsxFontSize] = useState<InboxExcelFontSize>(
    DEFAULT_INBOX_EXCEL_FONT_SIZE,
  );

  const reloadChain = useCallback(async (source: Stamp) => {
    const rows = await listFollowLinkChain(source);
    setChain(rows);
    setSelectedIds(new Set(rows.map((row) => row.id)));
    setPdfUri(null);
    if (rows[0]) {
      setPdfFileName(defaultPdfFileNameFromStampTitle(rows[0].title, true));
    }
    return rows;
  }, []);

  useEffect(() => {
    if (!visible || !anchor) {
      setChain([]);
      setError(null);
      setLoading(false);
      setSelectedIds(new Set());
      setPdfUri(null);
      setPdfBusy(false);
      setDeleteBusy(false);
      setXlsxBusy(false);
      setXlsxPxVisible(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void reloadChain(anchor)
      .catch(() => {
        if (!cancelled) {
          setError('연결 기록을 불러오지 못했습니다.');
          setChain([anchor]);
          setSelectedIds(new Set([anchor.id]));
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
  }, [visible, anchor?.id, reloadChain]);

  const selectedCount = selectedIds.size;
  const selectedStamps = useMemo(
    () => chain.filter((item) => selectedIds.has(item.id)),
    [chain, selectedIds],
  );
  const exportBusy = pdfBusy || deleteBusy || xlsxBusy;

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

  const handleCreatePdf = async () => {
    if (selectedStamps.length === 0 || exportBusy) {
      return;
    }
    setPdfBusy(true);
    try {
      const { createStampsPdf } = await loadStampPdfExport();
      const name = defaultPdfFileNameFromStampTitle(selectedStamps[0]?.title, true);
      setPdfFileName(name);
      const uri = await createStampsPdf(selectedStamps, name, name);
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
    if (!pdfUri || exportBusy) {
      return;
    }
    setPdfBusy(true);
    try {
      const { savePdf } = await loadStampPdfExport();
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
    if (!pdfUri || exportBusy) {
      return;
    }
    setPdfBusy(true);
    try {
      const { sharePdf } = await loadStampPdfExport();
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

  const handleOpenXlsxPx = async () => {
    if (selectedStamps.length === 0 || exportBusy) {
      return;
    }
    const [lastWidth, lastFont] = await Promise.all([
      getInboxExcelPreviewWidth(),
      getInboxExcelFontSize(),
    ]);
    setXlsxPxText(String(lastWidth));
    setXlsxFontSize(lastFont);
    setXlsxPxVisible(true);
  };

  const closeXlsxPxSheet = () => {
    if (xlsxBusy) {
      return;
    }
    setXlsxPxVisible(false);
  };

  const runShareXlsxWithPx = async (widthPx: number, fontSize: InboxExcelFontSize) => {
    if (selectedStamps.length === 0) {
      return;
    }
    setXlsxBusy(true);
    try {
      const { createStampsXlsx, shareStampsXlsx } = await loadStampXlsxExport();
      const result = await createStampsXlsx(selectedStamps, pdfFileName, {
        previewWidthPx: widthPx,
        fontSizePt: inboxExcelFontSizeToPt(fontSize),
      });
      await shareStampsXlsx(result);
      Alert.alert(
        '엑셀 저장 완료',
        Platform.OS === 'web'
          ? 'XLSX 파일을 다운로드했습니다. PC Excel에서 제목·메모·층을 편집할 수 있습니다.'
          : '엑셀을 앱 폴더에 저장했습니다. PC Excel에서 제목·메모·층을 편집할 수 있습니다.',
      );
    } catch (e) {
      Alert.alert(
        '엑셀 저장 실패',
        e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setXlsxBusy(false);
    }
  };

  const confirmXlsxPxSheet = () => {
    const widthPx = sanitizeInboxExcelPreviewWidth(xlsxPxText);
    const fontSize = sanitizeInboxExcelFontSize(xlsxFontSize);
    setXlsxPxVisible(false);
    void (async () => {
      await setInboxExcelPreviewWidth(widthPx);
      await setInboxExcelFontSize(fontSize);
      await runShareXlsxWithPx(widthPx, fontSize);
    })();
  };

  const handleTrash = () => {
    void (async () => {
      if (selectedStamps.length === 0 || exportBusy) {
        return;
      }
      const confirmed = await confirmAlert(
        '휴지통으로 이동',
        `선택한 ${selectedStamps.length}개 스탬프를 휴지통으로 옮깁니다.`,
        { confirmText: '삭제', destructive: true },
      );
      if (!confirmed) {
        return;
      }
      setDeleteBusy(true);
      try {
        const ids = selectedStamps.map((s) => s.id);
        const moved = await moveStampsToTrash(ids);
        if (moved === 0) {
          Alert.alert('삭제 실패', '스탬프를 찾을 수 없습니다.');
          return;
        }
        onChanged?.();
        if (!anchor) {
          onClose();
          return;
        }
        const rootId = resolveFollowRootId(anchor);
        if (ids.includes(rootId)) {
          onClose();
          return;
        }
        const remaining = await reloadChain(anchor).catch(() => [] as Stamp[]);
        if (remaining.length === 0) {
          onClose();
        }
      } catch (e) {
        Alert.alert(
          '삭제 실패',
          e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.',
        );
      } finally {
        setDeleteBusy(false);
      }
    })();
  };

  return (
    <>
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>연결 비교</Text>
          <Text style={styles.hint}>
            처음과 이음 스탬프를 나란히 봅니다. 카드를 눌러 선택한 뒤 PDF·엑셀·휴지통을 쓸 수 있습니다.
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
                const label = index === 0 ? '처음' : `이음 ${index}`;
                const isSelected = selectedIds.has(item.id);
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.card, isSelected && styles.cardSelected]}
                    onPress={() => toggleSelect(item.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${label} 선택`}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardLabel}>{label}</Text>
                      <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
                      </View>
                    </View>
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
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
          {!loading && chain.length < 2 ? (
            <Text style={styles.emptyHint}>아직 연결된 이음 스탬프가 없습니다.</Text>
          ) : null}

          <View style={styles.actionRow}>
            <Pressable
              style={[
                styles.actionButton,
                styles.actionPrimary,
                (selectedCount === 0 || exportBusy) && styles.actionDisabled,
              ]}
              onPress={handleCreatePdf}
              disabled={selectedCount === 0 || exportBusy}
              accessibilityLabel="선택 항목 PDF 만들기"
            >
              {pdfBusy && !pdfUri ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.actionPrimaryText}>PDF ({selectedCount})</Text>
              )}
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                styles.actionSecondary,
                (!pdfUri || exportBusy) && styles.actionDisabled,
              ]}
              onPress={handleSavePdf}
              disabled={!pdfUri || exportBusy}
              accessibilityLabel="PDF 저장"
            >
              <Text
                style={[
                  styles.actionSecondaryText,
                  (!pdfUri || exportBusy) && styles.actionTextDisabled,
                ]}
              >
                PDF 저장
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                styles.actionSecondary,
                (!pdfUri || exportBusy) && styles.actionDisabled,
              ]}
              onPress={handleSharePdf}
              disabled={!pdfUri || exportBusy}
              accessibilityLabel="PDF 공유"
            >
              <Text
                style={[
                  styles.actionSecondaryText,
                  (!pdfUri || exportBusy) && styles.actionTextDisabled,
                ]}
              >
                PDF 공유
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionButton,
                styles.actionSecondary,
                (selectedCount === 0 || exportBusy) && styles.actionDisabled,
              ]}
              onPress={() => void handleOpenXlsxPx()}
              disabled={selectedCount === 0 || exportBusy}
              accessibilityLabel="선택 항목 엑셀 만들기"
            >
              {xlsxBusy ? (
                <ActivityIndicator color="#2563eb" />
              ) : (
                <Text
                  style={[
                    styles.actionSecondaryText,
                    (selectedCount === 0 || exportBusy) && styles.actionTextDisabled,
                  ]}
                >
                  엑셀 ({selectedCount})
                </Text>
              )}
            </Pressable>
          </View>
          <Pressable
            style={[
              styles.trashButton,
              (selectedCount === 0 || exportBusy) && styles.actionDisabled,
            ]}
            onPress={handleTrash}
            disabled={selectedCount === 0 || exportBusy}
            accessibilityLabel="선택 항목 휴지통으로 이동"
          >
            {deleteBusy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.trashText}>휴지통으로 이동 ({selectedCount})</Text>
            )}
          </Pressable>
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
      <Modal
        visible={xlsxPxVisible}
        transparent
        animationType="fade"
        onRequestClose={closeXlsxPxSheet}
      >
        <View style={styles.xlsxPxBg}>
          <View style={styles.xlsxPxCard}>
            <Text style={styles.xlsxPxTitle}>엑셀 사진 가로 크기 (px)</Text>
            <Text style={styles.xlsxPxHint}>
              {MIN_INBOX_EXCEL_PREVIEW_WIDTH}–{MAX_INBOX_EXCEL_PREVIEW_WIDTH} · 기본{' '}
              {DEFAULT_INBOX_EXCEL_PREVIEW_WIDTH} · 세로는 비율 유지
            </Text>
            <TextInput
              style={styles.xlsxPxInput}
              value={xlsxPxText}
              onChangeText={setXlsxPxText}
              keyboardType="number-pad"
              maxLength={3}
              placeholder={String(DEFAULT_INBOX_EXCEL_PREVIEW_WIDTH)}
              editable={!xlsxBusy}
            />
            <View style={styles.xlsxPxChips}>
              {FOLLOW_XLSX_PX_PRESETS.map((n) => (
                <Pressable
                  key={n}
                  style={[
                    styles.xlsxPxChip,
                    xlsxPxText === String(n) && styles.xlsxPxChipOn,
                  ]}
                  onPress={() => setXlsxPxText(String(n))}
                  disabled={xlsxBusy}
                >
                  <Text
                    style={[
                      styles.xlsxPxChipText,
                      xlsxPxText === String(n) && styles.xlsxPxChipTextOn,
                    ]}
                  >
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.xlsxPxTitle}>글자 크기</Text>
            <Text style={styles.xlsxPxHint}>작음 10 · 보통 11 · 큼 14 (머리글은 굵게)</Text>
            <View style={styles.xlsxPxChips}>
              {(
                [
                  { id: 'small' as const, label: '작음' },
                  { id: 'normal' as const, label: '보통' },
                  { id: 'large' as const, label: '큼' },
                ] as const
              ).map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.xlsxPxChip,
                    xlsxFontSize === opt.id && styles.xlsxPxChipOn,
                  ]}
                  onPress={() => setXlsxFontSize(opt.id)}
                  disabled={xlsxBusy}
                >
                  <Text
                    style={[
                      styles.xlsxPxChipText,
                      xlsxFontSize === opt.id && styles.xlsxPxChipTextOn,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.xlsxPxPrimary, xlsxBusy && styles.actionDisabled]}
              onPress={confirmXlsxPxSheet}
              disabled={xlsxBusy}
            >
              <Text style={styles.xlsxPxPrimaryText}>엑셀 만들기</Text>
            </Pressable>
            <Pressable
              style={styles.xlsxPxSecondary}
              onPress={closeXlsxPxSheet}
              disabled={xlsxBusy}
            >
              <Text style={styles.xlsxPxSecondaryText}>취소</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
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
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    padding: 4,
  },
  cardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  image: {
    width: '100%',
    height: 200,
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexGrow: 1,
    minWidth: 96,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    backgroundColor: '#2563eb',
  },
  actionPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  actionSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  actionSecondaryText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  actionDisabled: {
    opacity: 0.45,
  },
  actionTextDisabled: {
    color: '#9ca3af',
  },
  trashButton: {
    borderRadius: 10,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    alignItems: 'center',
  },
  trashText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  closeButton: {
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
  xlsxPxBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  xlsxPxCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  xlsxPxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  xlsxPxHint: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  xlsxPxInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111',
  },
  xlsxPxChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  xlsxPxChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  xlsxPxChipOn: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  xlsxPxChipText: {
    color: '#111',
    fontWeight: '600',
  },
  xlsxPxChipTextOn: {
    color: '#fff',
  },
  xlsxPxPrimary: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  xlsxPxPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  xlsxPxSecondary: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  xlsxPxSecondaryText: {
    color: '#111',
    fontWeight: '600',
    fontSize: 15,
  },
});
