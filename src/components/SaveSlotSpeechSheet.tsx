import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSpeechInput } from '../hooks/useSpeechInput';

export type SaveSlotSpeechKey = 'title' | 'place' | 'memo';

export type SaveSlotSpeechDraft = {
  title: string;
  place: string;
  memo: string;
};

export type SaveSlotSpeechTemplateOption = {
  id: string;
  name: string;
};

type SlotDef = {
  key: SaveSlotSpeechKey;
  label: string;
  hint: string;
};

type SaveSlotSpeechSheetProps = {
  visible: boolean;
  titleLabel: string;
  placeLabel: string;
  memoLabel: string;
  titleHint?: string;
  placeHint?: string;
  memoHint?: string;
  templateName: string;
  templateId: string | null;
  templateOptions: SaveSlotSpeechTemplateOption[];
  templateOptionsLoading?: boolean;
  onSelectTemplate: (templateId: string) => void | Promise<void>;
  onRequestTemplateList?: () => void;
  onCommit: (draft: SaveSlotSpeechDraft) => void;
  onDismiss: () => void;
};

const EMPTY_DRAFT: SaveSlotSpeechDraft = { title: '', place: '', memo: '' };

/**
 * After a new stamp save sheet opens, walks title → place → memo one mic session at a time.
 * Optional type row + per-slot example hints from the active save template.
 */
export function SaveSlotSpeechSheet({
  visible,
  titleLabel,
  placeLabel,
  memoLabel,
  titleHint = '',
  placeHint = '',
  memoHint = '',
  templateName,
  templateId,
  templateOptions,
  templateOptionsLoading = false,
  onSelectTemplate,
  onRequestTemplateList,
  onCommit,
  onDismiss,
}: SaveSlotSpeechSheetProps) {
  const slots: SlotDef[] = [
    { key: 'title', label: titleLabel.trim() || '제목', hint: titleHint.trim() },
    { key: 'place', label: placeLabel.trim() || '장소', hint: placeHint.trim() },
    { key: 'memo', label: memoLabel.trim() || '메모', hint: memoHint.trim() },
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<SaveSlotSpeechDraft>(EMPTY_DRAFT);
  const [liveText, setLiveText] = useState('');
  const [typeListOpen, setTypeListOpen] = useState(false);
  const stepIndexRef = useRef(0);
  const draftRef = useRef<SaveSlotSpeechDraft>(EMPTY_DRAFT);

  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const handleListeningEnd = useCallback(() => {
    // Keep step; user chooses next / retry / commit.
  }, []);

  const { listening, available, start, stop } = useSpeechInput({
    onResult: (text, isFinal) => {
      const keys: SaveSlotSpeechKey[] = ['title', 'place', 'memo'];
      const key = keys[stepIndexRef.current];
      if (!key) {
        return;
      }
      const trimmed = text.trim();
      setLiveText(trimmed);
      if (isFinal) {
        setDraft((prev) => {
          const next = { ...prev, [key]: trimmed };
          draftRef.current = next;
          return next;
        });
      }
    },
    onListeningEnd: handleListeningEnd,
  });

  const stopRef = useRef(stop);
  stopRef.current = stop;
  const startRef = useRef(start);
  startRef.current = start;

  const beginSlot = useCallback(async () => {
    setLiveText('');
    await startRef.current();
  }, []);

  useEffect(() => {
    if (!visible) {
      stopRef.current();
      setStepIndex(0);
      setDraft(EMPTY_DRAFT);
      draftRef.current = EMPTY_DRAFT;
      setLiveText('');
      setTypeListOpen(false);
      return;
    }
    if (Platform.OS === 'web') {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled && !typeListOpen) {
        void beginSlot();
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopRef.current();
    };
    // typeListOpen intentionally omitted — reopen mic only on visible
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, beginSlot]);

  const current = slots[stepIndex] ?? slots[0];
  const confirmed = draft[current.key];
  const displayText = liveText || confirmed;
  const isLast = stepIndex >= slots.length - 1;
  const typeLabel = templateName.trim() || '유형 선택';

  const openTypeList = () => {
    if (listening) {
      stop();
    }
    setTypeListOpen(true);
    onRequestTemplateList?.();
  };

  const handlePickType = async (id: string) => {
    try {
      await onSelectTemplate(id);
      setTypeListOpen(false);
      setStepIndex(0);
      setDraft(EMPTY_DRAFT);
      draftRef.current = EMPTY_DRAFT;
      setLiveText('');
      await beginSlot();
    } catch {
      // Parent shows alert on failure.
    }
  };

  const handleRetry = async () => {
    if (listening) {
      stop();
    }
    setLiveText('');
    setDraft((prev) => {
      const next = { ...prev, [current.key]: '' };
      draftRef.current = next;
      return next;
    });
    await beginSlot();
  };

  const handleSkipOrNext = async () => {
    if (listening) {
      stop();
    }
    setLiveText('');
    if (isLast) {
      onCommit(draftRef.current);
      return;
    }
    setStepIndex((i) => i + 1);
    await beginSlot();
  };

  const handleCommit = () => {
    if (listening) {
      stop();
    }
    onCommit(draftRef.current);
  };

  const handleDismiss = () => {
    if (listening) {
      stop();
    }
    onDismiss();
  };

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.heading}>항목 말하기</Text>

          <Text style={styles.typeCaption}>저장 유형</Text>
          <Pressable
            style={styles.typeRow}
            onPress={openTypeList}
            accessibilityRole="button"
            accessibilityLabel={`저장 유형 ${typeLabel}, 바꾸려면 탭`}
          >
            <Text style={styles.typeName} numberOfLines={1}>
              {typeLabel}
            </Text>
            <Text style={styles.typeChange}>바꾸기</Text>
          </Pressable>

          {typeListOpen ? (
            <View style={styles.typeListBox}>
              {templateOptionsLoading ? (
                <ActivityIndicator color="#111" style={styles.typeListLoading} />
              ) : (
                <FlatList
                  data={templateOptions}
                  keyExtractor={(item) => item.id}
                  style={styles.typeList}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <Text style={styles.typeListEmpty}>선택 가능한 유형이 없습니다.</Text>
                  }
                  renderItem={({ item }) => {
                    const selected = item.id === templateId;
                    return (
                      <Pressable
                        style={[styles.typeItem, selected ? styles.typeItemSelected : null]}
                        onPress={() => void handlePickType(item.id)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        accessibilityLabel={item.name}
                      >
                        <Text
                          style={[
                            styles.typeItemText,
                            selected ? styles.typeItemTextSelected : null,
                          ]}
                          numberOfLines={2}
                        >
                          {item.name}
                        </Text>
                      </Pressable>
                    );
                  }}
                />
              )}
              <Pressable
                style={styles.linkBtn}
                onPress={() => {
                  setTypeListOpen(false);
                  void beginSlot();
                }}
                accessibilityRole="button"
                accessibilityLabel="유형 목록 닫기"
              >
                <Text style={styles.linkMuted}>목록 닫기</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.stepMeta}>
                {stepIndex + 1} / {slots.length}
              </Text>
              <Text style={styles.prompt}>{current.label}에 넣을 말을 하세요</Text>
              {current.hint ? (
                <Text style={styles.example} accessibilityLabel={`말하기 예 ${current.hint}`}>
                  말하기 예: {current.hint}
                </Text>
              ) : null}

              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptHint}>
                  {listening ? '인식 중' : available ? '대기' : '마이크 사용 불가'}
                </Text>
                <Text style={styles.transcriptBody}>
                  {displayText || (listening ? '…' : '아직 없음')}
                </Text>
              </View>

              <View style={styles.row}>
                <Pressable
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => void handleRetry()}
                  accessibilityRole="button"
                  accessibilityLabel="다시 듣기"
                >
                  <Text style={styles.btnGhostText}>다시</Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={() => void handleSkipOrNext()}
                  accessibilityRole="button"
                  accessibilityLabel={isLast ? '넣고 닫기' : '다음 항목'}
                >
                  <Text style={styles.btnPrimaryText}>{isLast ? '넣고 닫기' : '다음'}</Text>
                </Pressable>
              </View>

              {!isLast ? (
                <Pressable
                  style={styles.linkBtn}
                  onPress={handleCommit}
                  accessibilityRole="button"
                  accessibilityLabel="지금까지 말한 내용 넣기"
                >
                  <Text style={styles.linkText}>지금까지 넣기</Text>
                </Pressable>
              ) : null}
            </>
          )}

          <Pressable
            style={styles.linkBtn}
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="적용하지 않고 닫기"
          >
            <Text style={styles.linkMuted}>적용 없이 닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'android' ? 22 : 16,
    maxHeight: '88%',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  typeCaption: {
    marginTop: 12,
    fontSize: 12,
    color: '#6b7280',
  },
  typeRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
  },
  typeName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  typeChange: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  typeListBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    maxHeight: 220,
    overflow: 'hidden',
  },
  typeList: {
    maxHeight: 180,
  },
  typeListLoading: {
    paddingVertical: 24,
  },
  typeListEmpty: {
    color: '#6b7280',
    fontSize: 14,
    paddingVertical: 16,
    textAlign: 'center',
  },
  typeItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  typeItemSelected: {
    backgroundColor: '#eff6ff',
  },
  typeItemText: {
    fontSize: 15,
    color: '#111',
  },
  typeItemTextSelected: {
    fontWeight: '700',
    color: '#1d4ed8',
  },
  stepMeta: {
    marginTop: 10,
    fontSize: 13,
    color: '#6b7280',
  },
  prompt: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  example: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: '#6b7280',
  },
  transcriptBox: {
    marginTop: 12,
    minHeight: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    padding: 12,
  },
  transcriptHint: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  transcriptBody: {
    fontSize: 16,
    color: '#111',
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  btnGhostText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  btnPrimary: {
    backgroundColor: '#111',
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  linkMuted: {
    fontSize: 14,
    color: '#6b7280',
  },
});
