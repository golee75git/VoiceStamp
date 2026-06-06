import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type VoiceInputFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onMicPress: () => void;
  listening: boolean;
  multiline?: boolean;
  speechAvailable?: boolean;
};

export function VoiceInputField({
  label,
  value,
  onChangeText,
  onMicPress,
  listening,
  multiline = false,
  speechAvailable = true,
}: VoiceInputFieldProps) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={[styles.micButton, listening && styles.micButtonActive]}
          onPress={onMicPress}
          disabled={!speechAvailable}
        >
          <Text style={styles.micText}>{listening ? '●' : '🎤'}</Text>
        </Pressable>
      </View>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: '#c7d2fe',
  },
  micText: {
    fontSize: 16,
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
