import { useRef } from 'react';
import {
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

type ExportNameModalProps = {
  visible: boolean;
  fileName: string;
  reportTitle: string;
  onChangeFileName: (value: string) => void;
  onChangeReportTitle: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
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
}: ExportNameModalProps) {
  const scrollRef = useRef<ScrollView>(null);
  const reportTitleRef = useRef<TextInput>(null);

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
            <Text style={styles.hint}>PDF·이미지·엑셀·HWPX·프로젝트 내보내기에 사용됩니다.</Text>

            <Text style={styles.label}>PDF·이미지 파일명</Text>
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

            <Text style={[styles.label, styles.reportTitleLabel]}>보고서 제목</Text>
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  reportTitleLabel: {
    marginTop: 14,
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
