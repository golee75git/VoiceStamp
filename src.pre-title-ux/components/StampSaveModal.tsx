import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSpeechInput } from '../hooks/useSpeechInput';
import { formatDefaultStampTitle } from '../services/fileService';
import { getCurrentPlaceLabel } from '../services/locationService';
import { saveStamp, updateStamp } from '../services/saveStamp';
import type { Stamp } from '../types/stamp';
import { VoiceInputField } from './VoiceInputField';

type SpeechTarget = 'title' | 'memo' | null;

function appendSpeech(base: string, spoken: string): string {
  const trimmed = spoken.trim();
  if (!trimmed) {
    return base;
  }
  if (!base.trim()) {
    return trimmed;
  }
  return `${base.trimEnd()} ${trimmed}`;
}

type StampSaveModalProps = {
  visible: boolean;
  imageUri: string | null;
  stamp?: Stamp | null;
  onClose: () => void;
  onSaved: () => void;
};

export function StampSaveModal({
  visible,
  imageUri,
  stamp = null,
  onClose,
  onSaved,
}: StampSaveModalProps) {
  const isEdit = stamp != null;
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechTarget, setSpeechTarget] = useState<SpeechTarget>(null);
  const speechTargetRef = useRef<SpeechTarget>(null);
  const speechBaseRef = useRef({ title: '', memo: '' });
  const titleTouchedRef = useRef(false);

  useEffect(() => {
    speechTargetRef.current = speechTarget;
  }, [speechTarget]);

  const { listening, available, start, stop } = useSpeechInput({
    onResult: (text, isFinal) => {
      const target = speechTargetRef.current;
      if (target === 'title') {
        setTitle(appendSpeech(speechBaseRef.current.title, text));
      } else if (target === 'memo') {
        setMemo(appendSpeech(speechBaseRef.current.memo, text));
      }
      if (isFinal) {
        setSpeechTarget(null);
      }
    },
  });

  useEffect(() => {
    if (!visible) {
      setTitle('');
      setMemo('');
      setSaving(false);
      setError(null);
      setSpeechTarget(null);
      titleTouchedRef.current = false;
      stop();
    } else if (stamp) {
      setTitle(stamp.title);
      setMemo(stamp.memo);
      titleTouchedRef.current = true;
    }
  }, [visible, stamp, stop]);

  useEffect(() => {
    if (!visible || isEdit || !imageUri) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const place = await getCurrentPlaceLabel();
        if (cancelled || titleTouchedRef.current) {
          return;
        }
        setTitle(formatDefaultStampTitle(Date.now(), place ?? undefined));
      } catch {
        if (cancelled || titleTouchedRef.current) {
          return;
        }
        setTitle(formatDefaultStampTitle(Date.now()));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, isEdit, imageUri]);

  const handleMicPress = async (target: SpeechTarget) => {
    if (listening && speechTarget === target) {
      stop();
      setSpeechTarget(null);
      return;
    }

    if (target === 'title') {
      titleTouchedRef.current = true;
      speechBaseRef.current.title = title;
    } else if (target === 'memo') {
      speechBaseRef.current.memo = memo;
    }

    setSpeechTarget(target);
    const started = await start();
    if (!started) {
      setSpeechTarget(null);
    }
  };

  const handleSave = async () => {
    if (!imageUri || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEdit && stamp) {
        await updateStamp({ id: stamp.id, title, memo });
      } else {
        await saveStamp({
          tempImageUri: imageUri,
          title,
          memo,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? '수정에 실패했습니다.'
            : '저장에 실패했습니다.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.heading}>{isEdit ? '스탬프 수정' : '스탬프 저장'}</Text>

          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          ) : null}

          <VoiceInputField
            label="제목"
            value={title}
            onChangeText={(text) => {
              titleTouchedRef.current = true;
              setTitle(text);
            }}
            onMicPress={() => handleMicPress('title')}
            listening={listening && speechTarget === 'title'}
            speechAvailable={available}
          />

          <VoiceInputField
            label="메모"
            value={memo}
            onChangeText={setMemo}
            onMicPress={() => handleMicPress('memo')}
            listening={listening && speechTarget === 'memo'}
            speechAvailable={available}
            multiline
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>{isEdit ? '수정' : '저장'}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 14,
    maxHeight: '90%',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
});
