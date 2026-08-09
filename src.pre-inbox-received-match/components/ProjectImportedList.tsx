import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StampListThumb } from './StampListThumb';
import { resolveImageUri } from '../services/fileService';
import { listImportedStampsForProject } from '../services/projectImportedStamps';
import type { OwnedProject, ProjectImportFolderMode } from '../services/projectCollectSettings';
import { listStamps } from '../services/stampRepository';
import { moveStampsToTrash } from '../services/stampTrash';
import type { Stamp } from '../types/stamp';

type Props = {
  project: OwnedProject;
  folderMode: ProjectImportFolderMode;
  onChanged?: () => void;
};

export function ProjectImportedList({ project, folderMode, onChanged }: Props) {
  const [rows, setRows] = useState<Stamp[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const all = await listStamps();
    setRows(listImportedStampsForProject(all, project.name, folderMode));
    setSelected(new Set());
  }, [project.name, folderMode]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTrash = () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    Alert.alert(
      '휴지통으로 이동',
      `선택한 ${ids.length}장을 휴지통으로 옮깁니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '이동',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy(true);
              try {
                await moveStampsToTrash(ids);
                onChanged?.();
                await reload();
              } catch (e) {
                Alert.alert('삭제', e instanceof Error ? e.message : '실패');
              } finally {
                setBusy(false);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.flex}>
      <Text style={styles.hint}>
        「내 폰으로」가져온 사진입니다. 썸네일을 누르면 크게 보고, 행을 누르면 선택합니다.
      </Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPad}
        ListEmptyComponent={<Text style={styles.empty}>가져온 사진이 없습니다.</Text>}
        renderItem={({ item }) => {
          const on = selected.has(item.id);
          return (
            <Pressable
              style={[styles.row, on && styles.rowOn]}
              onPress={() => toggle(item.id)}
            >
              <Pressable
                onPress={() => setPreviewUri(resolveImageUri(item.imagePath))}
                hitSlop={4}
              >
                <StampListThumb id={item.id} imagePath={item.imagePath} style={styles.thumb} />
              </Pressable>
              <View style={styles.meta}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title || item.id}
                </Text>
                <Text style={styles.sub}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
      <View style={styles.bar}>
        <Pressable
          style={styles.barBtn}
          onPress={() => setSelected(new Set(rows.map((r) => r.id)))}
        >
          <Text style={styles.barBtnText}>전체</Text>
        </Pressable>
        <Pressable
          style={styles.barBtn}
          onPress={() => setSelected(new Set())}
        >
          <Text style={styles.barBtnText}>해제</Text>
        </Pressable>
        <Pressable
          style={styles.barBtn}
          onPress={handleTrash}
          disabled={busy || selected.size === 0}
        >
          <Text style={[styles.barBtnText, styles.danger]}>휴지통</Text>
        </Pressable>
      </View>
      {busy ? (
        <View style={styles.busy} pointerEvents="none">
          <ActivityIndicator color="#111" />
        </View>
      ) : null}
      <Modal visible={!!previewUri} transparent animationType="fade" onRequestClose={() => setPreviewUri(null)}>
        <Pressable style={styles.previewBg} onPress={() => setPreviewUri(null)}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.previewImg} resizeMode="contain" />
          ) : null}
          <Text style={styles.previewHint}>탭하면 닫힙니다</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hint: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  listPad: { paddingHorizontal: 16, paddingBottom: 12 },
  empty: { padding: 20, color: '#6b7280' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  rowOn: { backgroundColor: '#eff6ff', borderColor: '#93c5fd' },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  meta: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '700', color: '#111' },
  sub: { fontSize: 12, color: '#6b7280' },
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'android' ? 56 : 28,
  },
  barBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  barBtnText: { fontWeight: '700', color: '#111' },
  danger: { color: '#b91c1c' },
  busy: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  previewBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  previewImg: { width: '100%', height: '80%' },
  previewHint: { color: '#fff', marginTop: 12, fontWeight: '600' },
});
