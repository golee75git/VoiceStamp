import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useSpeechInput } from '../hooks/useSpeechInput';
import type { CameraHand } from '../services/settingsService';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const micIcon = require('../../assets/mic-icon.png');

type SpeechTarget = 'fileName' | 'reportTitle' | null;

type ExportNameModalProps = {
  visible: boolean;
  fileName: string;
  reportTitle: string;
  onChangeFileName: (value: string) => void;
  onChangeReportTitle: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
  /** 설정 카메라 손잡이: left=마이크 왼쪽, right=오른쪽 */
  cameraHand?: CameraHand;
};

export function ExportNameModal({
  visible,
  fileName,
  reportTitle,
  onChangeFileName,
  onChangeReportTitle,
  onConfirm,
  onCancel,
  disabled = false,
  cameraHand = 'right',
}: ExportNameModalProps) {
  const scrollRef = useRef<ScrollView>(null);
  const reportTitleRef = useRef<TextInput>(null);
  const [speechTarget, setSpeechTarget] = useState<SpeechTarget>(null);
  const speechTargetRef = useRef<SpeechTarget>(null);

  useEffect(() => {
    speechTargetRef.current = speechTarget;
  }, [speechTarget]);

  useEffect(() => {
    if (!visible) {
      setSpeechTarget(null);
    }
  }, [visible]);

  const { listening, available, start, stop } = useSpeechInput({
    onResult: (text) => {
      const trimmed = text.trim();
      const target = speechTargetRef.current;
      if (!trimmed || !target) {
        return;
      }
      if (target === 'fileName') {
        onChangeFileName(trimmed);
      } else {
        onChangeReportTitle(trimmed);
      }
    },
    onListeningEnd: () => {
      setSpeechTarget(null);
    },
  });

  const handleMicPress = useCallback(
    async (target: 'fileName' | 'reportTitle') => {
      if (disabled) {
        return;
      }
      if (listening && speechTarget === target) {
        stop();
        setSpeechTarget(null);
        return;
      }
      if (listening) {
        stop();
      }
      setSpeechTarget(target);
      const started = await start();
      if (!started) {
        setSpeechTarget(null);
      }
    },
    [disabled, listening, speechTarget, start, stop],
  );

  const micOnLeft = cameraHand === 'left';

  const renderLabelRow = (
    label: string,
    target: 'fileName' | 'reportTitle',
    extraLabelStyle?: object,
  ) => {
    const active = listening && speechTarget === target;
    return (
      <View style={[styles.labelRow, micOnLeft && styles.labelRowLeft, extraLabelStyle]}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={[styles.micButton, active && styles.micButtonActive]}
          onPress={() => handleMicPress(target)}
          disabled={disabled || !available}
          accessibilityLabel={
            active
              ? `${label} 음성 입력 중지`
              : `${label} 음성 입력`
          }
        >
          {active ? (
            <Text style={styles.micDot}>●</Text>
          ) : (
            <Image source={micIcon} style={styles.micIcon} resizeMode="contain" />
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="닫기" />
        <View style={styles.sheet}>
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            <Text style={styles.heading}>파일명·보고서 제목</Text>
            <Text style={styles.hint}>
              PDF·이미지·엑셀·HWPX·프로젝트 내보내기에 사용됩니다. 마이크는 설정의 카메라 손잡이
              쪽에 표시됩니다.
            </Text>

            {renderLabelRow('PDF·이미지 파일명', 'fileName')}
            <TextInput
              style={styles.input}
              value={fileName}
              onChangeText={onChangeFileName}
              placeholder="VoiceStamp"
              editable={!disabled}
              returnKeyType="next"
              onSubmitEditing={() => reportTitleRef.current?.focus()}
              blurOnSubmit={false}
            />

            {renderLabelRow('보고서 제목', 'reportTitle', styles.reportTitleLabel)}
            <TextInput
              ref={reportTitleRef}
              style={styles.input}
              value={reportTitle}
              onChangeText={onChangeReportTitle}
              placeholder="1페이지 상단 제목 (비우면 표시 안 함)"
              editable={!disabled}
              returnKeyType="done"
              onFocus={() => {
                requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
              }}
            />
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={disabled}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton, disabled && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={disabled}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '85%',
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  hint: {
    marginTop: 6,
    marginBottom: 16,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRowLeft: {
    flexDirection: 'row-reverse',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  reportTitleLabel: {
    marginTop: 14,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  micButtonActive: {
    backgroundColor: 'rgba(254, 226, 226, 0.9)',
  },
  micIcon: {
    width: 28,
    height: 28,
  },
  micDot: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fff',
    color: '#111',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  confirmButton: {
    backgroundColor: '#2563eb',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
