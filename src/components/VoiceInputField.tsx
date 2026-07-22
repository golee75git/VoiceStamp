import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FIELD_LABEL_MAX_LENGTH } from '../services/fieldLabels';
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
  onSelectionChange?: (selection: { start: number; end: number }) => void;
  selection?: { start: number; end: number };
  textAlign?: TextAlign;
  cameraHand?: CameraHand;
  /** Stamp field body font size (system font; from stamp text size setting). */
  fontSize?: number;
  /** Tap label to rename; commit via onLabelCommit (settings). */
  labelEditable?: boolean;
  onLabelCommit?: (nextLabel: string) => void;
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
  onSelectionChange,
  selection,
  textAlign = 'left',
  cameraHand = 'right',
  fontSize = 16,
  labelEditable = false,
  onLabelCommit,
}: VoiceInputFieldProps) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);

  useEffect(() => {
    if (!editingLabel) {
      setDraftLabel(label);
    }
  }, [label, editingLabel]);

  const commitLabel = () => {
    setEditingLabel(false);
    onLabelCommit?.(draftLabel);
  };

  return (
    <View style={styles.field}>
      <View style={[styles.labelRow, cameraHand === 'left' && styles.labelRowLeft]}>
        {labelEditable && editingLabel ? (
          <TextInput
            style={styles.labelInput}
            value={draftLabel}
            onChangeText={setDraftLabel}
            onBlur={commitLabel}
            onSubmitEditing={commitLabel}
            maxLength={FIELD_LABEL_MAX_LENGTH}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            placeholder={label}
            accessibilityLabel="필드 표시명 수정"
          />
        ) : labelEditable ? (
          <Pressable
            onPress={() => setEditingLabel(true)}
            accessibilityRole="button"
            accessibilityLabel={`${label} 표시명 수정`}
            accessibilityHint="탭하면 칸 이름을 바꿀 수 있습니다. 설정에도 저장됩니다."
            hitSlop={6}
          >
            <Text style={[styles.label, styles.labelEditable]}>{label}</Text>
          </Pressable>
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
        <View style={[styles.micGroup, cameraHand === 'left' && styles.micGroupLeft]}>
          {speechAvailable ? (
            <Text style={styles.micHint}>(눌러서 말하기)</Text>
          ) : null}
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
      </View>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline, { textAlign, fontSize }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onSelectionChange={(event) => onSelectionChange?.(event.nativeEvent.selection)}
        selection={selection}
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
  labelEditable: {
    textDecorationLine: 'underline',
    textDecorationColor: '#93c5fd',
  },
  labelInput: {
    flex: 1,
    marginRight: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
    paddingVertical: 2,
    paddingHorizontal: 0,
    maxWidth: '55%',
  },
  micGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  micGroupLeft: {
    flexDirection: 'row-reverse',
  },
  micHint: {
    fontSize: 12,
    color: '#6b7280',
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
  micDot: {
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
