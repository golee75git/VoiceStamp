import { Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type CaptureActionSheetProps = {
  visible: boolean;
  imageUri: string | null;
  locationPrefetchLoading?: boolean;
  onRetake: () => void;
  onSave: () => void;
  onContinuous: () => void;
};

export function CaptureActionSheet({
  visible,
  imageUri,
  locationPrefetchLoading = false,
  onRetake,
  onSave,
  onContinuous,
}: CaptureActionSheetProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onRetake}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>珥ъ쁺???ъ쭊</Text>
          <Text style={styles.hint}>?ㅼ쓬 以??섎굹瑜??좏깮?섏꽭??</Text>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          ) : null}
          {locationPrefetchLoading ? (
            <Text style={styles.locationHint}>?꾩튂 ?뺤씤 以묅?/Text>
          ) : null}
          <Pressable style={styles.primaryButton} onPress={onContinuous} accessibilityLabel="?곗냽 珥ъ쁺">
            <Text style={styles.primaryButtonText}>?곗냽 珥ъ쁺</Text>
            <Text style={styles.buttonHint}>湲곕낯 ?쒕ぉ?쇰줈 ?????諛붾줈 ?ㅼ쓬 珥ъ쁺</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onSave} accessibilityLabel="???>
            <Text style={styles.secondaryButtonText}>???/Text>
            <Text style={styles.buttonHintMuted}>?쒕ぉ쨌硫붾え ?낅젰 ?????/Text>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={onRetake} accessibilityLabel="?ㅼ떆 珥ъ쁺">
            <Text style={styles.ghostButtonText}>?ㅼ떆 珥ъ쁺</Text>
            <Text style={styles.buttonHintMuted}>??ν븯吏 ?딄퀬 ?ㅼ떆 李띻린</Text>
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
  locationHint: {
    color: '#2563eb',
    fontSize: 13,
    textAlign: 'center',
  },
});
