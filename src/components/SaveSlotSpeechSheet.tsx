import { useCallback, useEffect, useRef, useState } from 'react';
import {
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

type SlotDef = {
  key: SaveSlotSpeechKey;
  label: string;
};

type SaveSlotSpeechSheetProps = {
  visible: boolean;
  titleLabel: string;
  placeLabel: string;
  memoLabel: string;
  onCommit: (draft: SaveSlotSpeechDraft) => void;
  onDismiss: () => void;
};

const EMPTY_DRAFT: SaveSlotSpeechDraft = { title: '', place: '', memo: '' };

/**
 * After a new stamp save sheet opens, walks title → place → memo one mic session at a time.
 * Uses the same on-device STT path as VoiceInputField (no new packages).
 */
export function SaveSlotSpeechSheet({
  visible,
  titleLabel,
  placeLabel,
  memoLabel,
  onCommit,
  onDismiss,
}: SaveSlotSpeechSheetProps) {
  const slots: SlotDef[] = [
    { key: 'title', label: titleLabel.trim() || '제목' },
    { key: 'place', label: placeLabel.trim() || '장소' },
    { key: 'memo', label: memoLabel.trim() || '메모' },
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<SaveSlotSpeechDraft>(EMPTY_DRAFT);
  const [liveText, setLiveText] = useState('');
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
      return;
    }
    if (Platform.OS === 'web') {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) {
        void beginSlot();
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopRef.current();
    };
  }, [visible, beginSlot]);

  const current = slots[stepIndex] ?? slots[0];
  const confirmed = draft[current.key];
  const displayText = liveText || confirmed;
  const isLast = stepIndex >= slots.length - 1;

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
          <Text style={styles.heading}>칸 말하기</Text>
          <Text style={styles.stepMeta}>
            {stepIndex + 1} / {slots.length}
          </Text>
          <Text style={styles.prompt}>{current.label}에 넣을 말을 하세요</Text>

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
              accessibilityLabel={isLast ? '넣고 닫기' : '다음 칸'}
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
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  stepMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  prompt: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  transcriptBox: {
    marginTop: 14,
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
