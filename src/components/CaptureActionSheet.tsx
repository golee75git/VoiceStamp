import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type CaptureActionSheetProps = {
  visible: boolean;
  imageUri: string | null;
  onRetake: () => void;
  onSave: () => void;
  onContinuous: () => void;
};

export function CaptureActionSheet({
  visible,
  imageUri,
  onRetake,
  onSave,
  onContinuous,
}: CaptureActionSheetProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onRetake}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>촬영한 사진</Text>
          <Text style={styles.hint}>다음 중 하나를 선택하세요.</Text>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          ) : null}
          <Pressable style={styles.primaryButton} onPress={onContinuous} accessibilityLabel="연속 촬영">
            <Text style={styles.primaryButtonText}>연속 촬영</Text>
            <Text style={styles.buttonHint}>기본 제목으로 저장 후 바로 다음 촬영</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onSave} accessibilityLabel="저장">
            <Text style={styles.secondaryButtonText}>저장</Text>
            <Text style={styles.buttonHintMuted}>제목·메모 입력 후 저장</Text>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={onRetake} accessibilityLabel="다시 촬영">
            <Text style={styles.ghostButtonText}>다시 촬영</Text>
            <Text style={styles.buttonHintMuted}>저장하지 않고 다시 찍기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 2,
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 16,
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 2,
  },
  ghostButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonHint: {
    color: '#dbeafe',
    fontSize: 12,
  },
  buttonHintMuted: {
    color: '#6b7280',
    fontSize: 12,
  },
});
