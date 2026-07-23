import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  STAMP_FIELD_TEMPLATES,
  applyStampFieldTemplate,
  type StampFieldTemplate,
} from '../services/stampFieldTemplates';

type FieldTemplateSheetProps = {
  visible: boolean;
  onClose: () => void;
  onApplied: (template: StampFieldTemplate) => void;
};

export function FieldTemplateSheet({ visible, onClose, onApplied }: FieldTemplateSheetProps) {
  const handleSelect = async (templateId: string) => {
    try {
      const applied = await applyStampFieldTemplate(templateId);
      onApplied(applied);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : '템플릿을 적용하지 못했습니다.';
      Alert.alert('저장 템플릿', message);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>저장 템플릿</Text>
          <Text style={styles.hint}>
            필드 표시명을 바꿉니다. 입력칸에는 예시가 흐리게 보이고, 촬영일시는 촬영 시각이 사용됩니다.
          </Text>
          {STAMP_FIELD_TEMPLATES.map((template) => (
            <Pressable
              key={template.id}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => void handleSelect(template.id)}
              accessibilityLabel={template.name}
            >
              <Text style={styles.itemTitle}>{template.name}</Text>
              <Text style={styles.itemMeta} numberOfLines={2}>
                {template.labels.titleFieldLabel} · {template.labels.placeFieldLabel} ·{' '}
                {template.labels.memoFieldLabel} · {template.labels.extra1FieldLabel} ·{' '}
                {template.labels.extra2FieldLabel} · {template.labels.extra3FieldLabel}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={({ pressed }) => [styles.cancel, pressed && styles.cancelPressed]}
            onPress={onClose}
            accessibilityLabel="닫기"
          >
            <Text style={styles.cancelText}>닫기</Text>
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
    paddingBottom: 28,
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
    marginBottom: 4,
    lineHeight: 18,
  },
  item: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  itemPressed: {
    backgroundColor: '#dbeafe',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  cancel: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelPressed: {
    backgroundColor: '#f3f4f6',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
