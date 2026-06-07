import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { CameraHand, TextAlign } from '../services/settingsService';

const micIcon = require('../../assets/mic-icon.png');

type VoiceInputFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onMicPress: () => void;
  listening: boolean;
  multiline?: boolean;
  speechAvailable?: boolean;
  onFocus?: () => void;
  textAlign?: TextAlign;
  cameraHand?: CameraHand;
};

export function VoiceInputField({
  label,
  value,
  onChangeText,
  onMicPress,
  listening,
  multiline = false,
  speechAvailable = true,
  onFocus,
  textAlign = 'left',
  cameraHand = 'right',
}: VoiceInputFieldProps) {
  return (
    <View style={styles.field}>
      <View style={[styles.labelRow, cameraHand === 'left' && styles.labelRowLeft]}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={[styles.micButton, listening && styles.micButtonActive]}
          onPress={onMicPress}
          disabled={!speechAvailable}
        >
          {listening ? (
            <Text style={styles.micDot}>●</Text>
          ) : (
            <Image source={micIcon} style={styles.micIcon} resizeMode="contain" />
          )}
        </Pressable>
      </View>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline, { textAlign }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={`${label} 입력`}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {!speechAvailable ? (
        <Text style={styles.hint}>음성 입력은 개발 빌드에서 사용할 수 있습니다.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: 'rgba(199, 210, 254, 0.45)',
  },
  micIcon: {
    width: 32,
    height: 32,
  },
  micIconActive: {
    opacity: 0.85,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputMultiline: {
    minHeight: 96,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
  },
});
