import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  FIELD_LABEL_MAX_LENGTH,
  type FieldLabels,
} from '../services/fieldLabels';
import {
  CUSTOM_TEMPLATE_NAME_MAX,
  CUSTOM_TEMPLATE_PLACEHOLDER_MAX,
  DEFAULT_CUSTOM_TEMPLATE_LABELS,
  STAMP_FIELD_TEMPLATES,
  type FieldPlaceholders,
  type StampFieldTemplate,
  upsertCustomStampFieldTemplate,
} from '../services/stampFieldTemplates';

type CustomFieldTemplateEditorProps = {
  visible: boolean;
  /** When set, edit mode; otherwise create. */
  initial?: StampFieldTemplate | null;
  onClose: () => void;
  onSaved: (template: StampFieldTemplate) => void;
};

const EMPTY_PLACEHOLDERS: FieldPlaceholders = {
  title: '',
  place: '',
  memo: '',
  extra1: '',
  extra2: '',
  extra3: '',
};

const LABEL_ROWS: { key: keyof FieldLabels; hint: string }[] = [
  { key: 'titleFieldLabel', hint: '예: 점검대상' },
  { key: 'placeFieldLabel', hint: '예: 위치' },
  { key: 'memoFieldLabel', hint: '예: 현장내용' },
  { key: 'extra1FieldLabel', hint: '예: 위험도' },
  { key: 'extra2FieldLabel', hint: '예: 조치요청' },
  { key: 'extra3FieldLabel', hint: '예: 처리상태' },
];

const PLACEHOLDER_ROWS: { key: keyof FieldPlaceholders; label: string }[] = [
  { key: 'title', label: '제목 칸 예시' },
  { key: 'place', label: '장소 칸 예시' },
  { key: 'memo', label: '메모 칸 예시' },
  { key: 'extra1', label: '추가1 칸 예시' },
  { key: 'extra2', label: '추가2 칸 예시' },
  { key: 'extra3', label: '추가3 칸 예시' },
];

export function CustomFieldTemplateEditor({
  visible,
  initial,
  onClose,
  onSaved,
}: CustomFieldTemplateEditorProps) {
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * 0.92);
  const isEdit = Boolean(initial?.custom && initial.id);

  const [name, setName] = useState('');
  const [labels, setLabels] = useState<FieldLabels>({ ...DEFAULT_CUSTOM_TEMPLATE_LABELS });
  const [placeholders, setPlaceholders] = useState<FieldPlaceholders>({ ...EMPTY_PLACEHOLDERS });
  const [pickSourceVisible, setPickSourceVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setName(initial.name);
      setLabels({ ...initial.labels });
      setPlaceholders({ ...initial.placeholders });
    } else {
      setName('');
      setLabels({ ...DEFAULT_CUSTOM_TEMPLATE_LABELS });
      setPlaceholders({ ...EMPTY_PLACEHOLDERS });
    }
    setPickSourceVisible(false);
    setSaving(false);
  }, [visible, initial]);

  const applySource = (source: StampFieldTemplate) => {
    setLabels({ ...source.labels });
    setPlaceholders({ ...source.placeholders });
    if (!name.trim()) {
      setName(`${source.name} 복사`.slice(0, CUSTOM_TEMPLATE_NAME_MAX));
    }
    setPickSourceVisible(false);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const saved = await upsertCustomStampFieldTemplate({
        id: isEdit ? initial!.id : undefined,
        name,
        labels,
        placeholders,
      });
      onSaved(saved);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : '템플릿을 저장하지 못했습니다.';
      Alert.alert('내 템플릿', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { maxHeight: sheetMaxHeight }]}>
          <Text style={styles.title} accessibilityRole="header">
            {isEdit ? '내 템플릿 수정' : '내 템플릿 만들기'}
          </Text>
          <Text style={styles.hint}>
            템플릿 이름과 필드 표시명을 정합니다. 기존 기본 템플릿을 가져와 수정할 수 있습니다.
          </Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            <Text style={styles.label}>템플릿 이름</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="예: 우리 학교 점검"
              placeholderTextColor="#9ca3af"
              maxLength={CUSTOM_TEMPLATE_NAME_MAX}
              accessibilityLabel="템플릿 이름"
            />

            <Pressable
              style={({ pressed }) => [styles.importBtn, pressed && styles.importBtnPressed]}
              onPress={() => setPickSourceVisible(true)}
              accessibilityLabel="기존 템플릿에서 가져오기"
            >
              <Text style={styles.importBtnText}>기존 템플릿에서 가져오기</Text>
            </Pressable>

            <Text style={styles.section}>필드 표시명</Text>
            {LABEL_ROWS.map((row) => (
              <View key={row.key} style={styles.fieldBlock}>
                <Text style={styles.label}>{row.hint.replace(/^예:\s*/, '')} 표시명</Text>
                <TextInput
                  style={styles.input}
                  value={labels[row.key]}
                  onChangeText={(text) => setLabels((prev) => ({ ...prev, [row.key]: text }))}
                  placeholder={row.hint}
                  placeholderTextColor="#9ca3af"
                  maxLength={FIELD_LABEL_MAX_LENGTH}
                  accessibilityLabel={`${row.key} 표시명`}
                />
              </View>
            ))}

            <Text style={styles.section}>입력칸 예시 (선택)</Text>
            <Text style={styles.subHint}>저장 화면에 흐리게 보이는 안내 문구입니다. 비워 둘 수 있습니다.</Text>
            {PLACEHOLDER_ROWS.map((row) => (
              <View key={row.key} style={styles.fieldBlock}>
                <Text style={styles.label}>{row.label}</Text>
                <TextInput
                  style={styles.input}
                  value={placeholders[row.key]}
                  onChangeText={(text) =>
                    setPlaceholders((prev) => ({ ...prev, [row.key]: text }))
                  }
                  placeholder="선택"
                  placeholderTextColor="#9ca3af"
                  maxLength={CUSTOM_TEMPLATE_PLACEHOLDER_MAX}
                  accessibilityLabel={row.label}
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}
              onPress={onClose}
              accessibilityLabel="취소"
            >
              <Text style={styles.secondaryText}>취소</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.primary,
                pressed && styles.primaryPressed,
                saving && styles.primaryDisabled,
              ]}
              onPress={() => void handleSave()}
              disabled={saving}
              accessibilityLabel="저장"
            >
              <Text style={styles.primaryText}>{saving ? '저장 중…' : '저장'}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        visible={pickSourceVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setPickSourceVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.pickSheet, { maxHeight: Math.round(windowHeight * 0.7) }]}>
            <Text style={styles.title}>가져올 템플릿</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {STAMP_FIELD_TEMPLATES.map((template) => (
                <Pressable
                  key={template.id}
                  style={({ pressed }) => [styles.pickItem, pressed && styles.pickItemPressed]}
                  onPress={() => applySource(template)}
                  accessibilityLabel={`${template.name} 가져오기`}
                >
                  <Text style={styles.pickItemTitle}>{template.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}
              onPress={() => setPickSourceVisible(false)}
            >
              <Text style={styles.secondaryText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    paddingBottom: Platform.OS === 'android' ? 48 : 36,
    gap: 10,
  },
  pickSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'android' ? 48 : 36,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  hint: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  subHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    gap: 8,
    paddingBottom: 8,
  },
  section: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  fieldBlock: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },
  importBtn: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 4,
  },
  importBtnPressed: {
    backgroundColor: '#dbeafe',
  },
  importBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryPressed: {
    backgroundColor: '#f3f4f6',
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  primary: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  primaryPressed: {
    backgroundColor: '#1d4ed8',
  },
  primaryDisabled: {
    opacity: 0.6,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  pickItem: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  pickItemPressed: {
    backgroundColor: '#f3f4f6',
  },
  pickItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
});
