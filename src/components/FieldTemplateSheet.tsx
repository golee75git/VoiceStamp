import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  STAMP_FIELD_TEMPLATES,
  applyStampFieldTemplate,
  deleteCustomStampFieldTemplate,
  listCustomStampFieldTemplates,
  type StampFieldTemplate,
} from '../services/stampFieldTemplates';
import { CustomFieldTemplateEditor } from './CustomFieldTemplateEditor';

type FieldTemplateSheetProps = {
  visible: boolean;
  onClose: () => void;
  onApplied: (template: StampFieldTemplate) => void;
};

export function FieldTemplateSheet({ visible, onClose, onApplied }: FieldTemplateSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * 0.85);
  const [customs, setCustoms] = useState<StampFieldTemplate[]>([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editing, setEditing] = useState<StampFieldTemplate | null>(null);

  const reloadCustoms = useCallback(async () => {
    try {
      setCustoms(await listCustomStampFieldTemplates());
    } catch {
      setCustoms([]);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    void reloadCustoms();
    setEditorVisible(false);
    setEditing(null);
  }, [visible, reloadCustoms]);

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

  const openCreate = () => {
    setEditing(null);
    setEditorVisible(true);
  };

  const openEdit = (template: StampFieldTemplate) => {
    setEditing(template);
    setEditorVisible(true);
  };

  const confirmDelete = (template: StampFieldTemplate) => {
    Alert.alert('내 템플릿 삭제', `"${template.name}" 템플릿을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteCustomStampFieldTemplate(template.id);
              await reloadCustoms();
            } catch (error) {
              const message = error instanceof Error ? error.message : '삭제하지 못했습니다.';
              Alert.alert('내 템플릿', message);
            }
          })();
        },
      },
    ]);
  };

  const handleCustomLongPress = (template: StampFieldTemplate) => {
    Alert.alert(template.name, '수정하거나 삭제할 수 있습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '수정', onPress: () => openEdit(template) },
      { text: '삭제', style: 'destructive', onPress: () => confirmDelete(template) },
    ]);
  };

  const renderItem = (template: StampFieldTemplate, custom: boolean) => (
    <Pressable
      key={template.id}
      style={({ pressed }) => [
        styles.item,
        custom && styles.itemCustom,
        pressed && (custom ? styles.itemCustomPressed : styles.itemPressed),
      ]}
      onPress={() => void handleSelect(template.id)}
      onLongPress={custom ? () => handleCustomLongPress(template) : undefined}
      delayLongPress={400}
      accessibilityLabel={
        custom ? `${template.name}, 길게 누르면 수정·삭제` : template.name
      }
    >
      <Text style={[styles.itemTitle, custom && styles.itemTitleCustom]}>{template.name}</Text>
      <Text style={styles.itemMeta} numberOfLines={2}>
        {template.labels.titleFieldLabel} · {template.labels.placeFieldLabel} ·{' '}
        {template.labels.memoFieldLabel} · {template.labels.extra1FieldLabel} ·{' '}
        {template.labels.extra2FieldLabel} · {template.labels.extra3FieldLabel}
      </Text>
      {custom ? <Text style={styles.longPressHint}>길게 눌러 수정·삭제</Text> : null}
    </Pressable>
  );

  return (
    <>
      <Modal visible={visible && !editorVisible} animationType="fade" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { maxHeight: sheetMaxHeight }]}>
            <Text style={styles.title} accessibilityRole="header">
              저장 템플릿
            </Text>
            <Text style={styles.hint}>
              필드 표시명을 바꿉니다. 입력칸에는 예시가 흐리게 보이고, 촬영일시는 촬영 시각이 사용됩니다.
            </Text>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <Pressable
                style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
                onPress={openCreate}
                accessibilityLabel="내 템플릿 만들기"
              >
                <Text style={styles.createBtnText}>＋ 내 템플릿 만들기</Text>
              </Pressable>

              {customs.length > 0 ? (
                <>
                  <Text style={styles.section}>내 템플릿</Text>
                  {customs.map((template) => renderItem(template, true))}
                </>
              ) : null}

              <Text style={styles.section}>기본 템플릿</Text>
              {STAMP_FIELD_TEMPLATES.map((template) => renderItem(template, false))}
            </ScrollView>
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

      <CustomFieldTemplateEditor
        visible={editorVisible}
        initial={editing}
        onClose={() => {
          setEditorVisible(false);
          setEditing(null);
        }}
        onSaved={() => {
          void reloadCustoms();
        }}
      />
    </>
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
    // Lift above Android gesture/nav bar so 「닫기」 stays tappable.
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
    marginBottom: 4,
    lineHeight: 18,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 4,
  },
  section: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  createBtn: {
    borderWidth: 1,
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  createBtnPressed: {
    backgroundColor: '#dcfce7',
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d',
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
  itemCustom: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  itemPressed: {
    backgroundColor: '#dbeafe',
  },
  itemCustomPressed: {
    backgroundColor: '#dcfce7',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  itemTitleCustom: {
    color: '#15803d',
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  longPressHint: {
    fontSize: 11,
    color: '#86efac',
    marginTop: 2,
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
