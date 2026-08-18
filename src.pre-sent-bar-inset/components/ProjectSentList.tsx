import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StampListThumb } from './StampListThumb';
import { resolveImageUri } from '../services/fileService';
import {
  getUploadRecordMap,
  listSentStampIdsForProject,
  type JoinedProjectHistory,
  type ProjectUploadStatus,
} from '../services/projectCollectSettings';
import { listStamps } from '../services/stampRepository';
import { moveStampsToTrash } from '../services/stampTrash';
import { retryProjectUpload } from '../services/projectUploadQueue';
import type { Stamp } from '../types/stamp';

type Props = {
  project: Pick<JoinedProjectHistory, 'projectId' | 'name'>;
  onChanged?: () => void;
};

type SentRow = Stamp & { uploadStatus: ProjectUploadStatus; joinSendWay?: string | null };

function statusLabel(status: ProjectUploadStatus): string {
  if (status === 'synced') return '전송됨';
  if (status === 'failed') return '전송 실패';
  if (status === 'pending' || status === 'uploading') return '전송 중';
  return status;
}

function joinSendWayLabel(way?: string | null): string {
  if (way === 'album') return '갤러리';
  if (way === 'shot') return '촬영';
  return '';
}

export function ProjectSentList({ project, onChanged }: Props) {
  const [rows, setRows] = useState<SentRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [all, ids, records] = await Promise.all([
      listStamps(),
      listSentStampIdsForProject(project.projectId),
      getUploadRecordMap(),
    ]);
    const idSet = new Set(ids);
    const next: SentRow[] = [];
    for (const stamp of all) {
      if (!idSet.has(stamp.id)) continue;
      const status = records[stamp.id]?.status;
      if (!status || status === 'received') continue;
      next.push({ ...stamp, uploadStatus: status, joinSendWay: records[stamp.id]?.joinSendWay });
    }
    next.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setRows(next);
    setSelected(new Set());
  }, [project.projectId]);

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

  const handleRetryFailed = () => {
    const ids = rows.filter((r) => selected.has(r.id) && r.uploadStatus === 'failed').map((r) => r.id);
    if (ids.length === 0) {
      Alert.alert('다시 올리기', '전송 실패한 항목을 선택하세요.');
      return;
    }
    void (async () => {
      setBusy(true);
      try {
        for (const id of ids) {
          await retryProjectUpload(id);
        }
        await reload();
      } finally {
        setBusy(false);
      }
    })();
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
        「{project.name}」으로 올린 사진입니다. 설정에서 「전송분 저장 목록에서 숨기기」를 켜도 여기서는
        볼 수 있습니다.
      </Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPad}
        ListEmptyComponent={
          <Text style={styles.empty}>보낸 사진이 없습니다. (연결 후 새로 저장·전송한 항목만 기록됩니다)</Text>
        }
        renderItem={({ item }) => {
          const on = selected.has(item.id);
          return (
            <Pressable style={[styles.row, on && styles.rowOn]} onPress={() => toggle(item.id)}>
              <Pressable onPress={() => setPreviewUri(resolveImageUri(item.imagePath))} hitSlop={4}>
                <StampListThumb id={item.id} imagePath={item.imagePath} style={styles.thumb} />
              </Pressable>
              <View style={styles.meta}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title || item.id}
                </Text>
                <Text style={styles.sub}>
                  {[
                    joinSendWayLabel(item.joinSendWay),
                    statusLabel(item.uploadStatus),
                    item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
      <View style={styles.bar}>
        <Pressable style={styles.barBtn} onPress={handleRetryFailed} disabled={busy || selected.size === 0}>
          {busy ? <ActivityIndicator color="#2563eb" /> : <Text style={styles.barBtnText}>실패 재전송</Text>}
        </Pressable>
        <Pressable style={styles.barBtn} onPress={handleTrash} disabled={busy || selected.size === 0}>
          <Text style={[styles.barBtnText, styles.barBtnDanger]}>휴지통</Text>
        </Pressable>
      </View>
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
  hint: { fontSize: 13, color: '#6b7280', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  listPad: { paddingHorizontal: 12, paddingBottom: 80 },
  empty: { color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rowOn: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  meta: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280' },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  barBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  barBtnText: { color: '#2563eb', fontWeight: '700' },
  barBtnDanger: { color: '#b91c1c' },
  previewBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  previewImg: { width: '100%', height: '80%' },
  previewHint: { color: '#e5e7eb', marginTop: 12 },
});
