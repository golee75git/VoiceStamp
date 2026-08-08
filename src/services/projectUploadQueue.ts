import { Platform } from 'react-native';

import { readImageDataUriForPdf } from './pdfImageForExport';
import {
  apiCompleteUpload,
  apiPrepareUpload,
  mapProjectApiError,
} from './projectCollectApi';
import {
  getOrCreateDeviceId,
  getProjectAutoUpload,
  getProjectCollectEnabled,
  getProjectJoin,
  setUploadStatus,
} from './projectCollectSettings';
import type { Stamp } from '../types/stamp';

let failStreak = 0;
let draining = false;
const queue: string[] = [];

export function enqueueProjectUpload(stampId: string): void {
  if (!queue.includes(stampId)) {
    queue.push(stampId);
  }
  void drainProjectUploadQueue();
}

export async function scheduleProjectUploadAfterSave(stamp: Stamp): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    const enabled = await getProjectCollectEnabled();
    if (!enabled) return;
    const join = await getProjectJoin();
    if (!join) return;
    const auto = await getProjectAutoUpload();
    if (!auto) return;
    await setUploadStatus(stamp.id, 'pending');
    enqueueProjectUpload(stamp.id);
  } catch {
    // non-fatal
  }
}

async function putImageToPresignedUrl(putUrl: string, dataUri: string): Promise<void> {
  const imgRes = await fetch(dataUri);
  if (!imgRes.ok) {
    const err = new Error('bad_image');
    (err as Error & { code?: string }).code = 'bad_image';
    throw err;
  }
  const body = await imgRes.arrayBuffer();
  if (body.byteLength < 32 || body.byteLength > 2_800_000) {
    const err = new Error('bad_image');
    (err as Error & { code?: string }).code = 'bad_image';
    throw err;
  }
  const putRes = await fetch(putUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body,
  });
  if (!putRes.ok) {
    const err = new Error('put_failed');
    (err as Error & { code?: string }).code = 'put_failed';
    throw err;
  }
}

async function uploadOne(stampId: string): Promise<void> {
  const { getStampById } = await import('./stampRepository');
  const stamp = await getStampById(stampId);
  if (!stamp || stamp.deletedAt) {
    return;
  }
  const join = await getProjectJoin();
  if (!join) return;

  await setUploadStatus(stampId, 'uploading');
  const deviceId = await getOrCreateDeviceId();
  const dataUri = await readImageDataUriForPdf(stamp.imagePath, 'compressed');
  const prepared = await apiPrepareUpload({
    projectId: join.projectId,
    uploadCode: join.uploadCode,
    stampId: stamp.id,
    meta: {
      uploadedByDeviceId: deviceId,
      uploadedByMark: join.mark || null,
      title: stamp.title,
      memo: stamp.memo,
      placeLabel: stamp.placeLabel,
      floor: stamp.floor,
      latitude: stamp.latitude,
      longitude: stamp.longitude,
      createdAt: stamp.createdAt,
      localGroupName: null,
      templateId: stamp.templateId || null,
    },
  });
  await putImageToPresignedUrl(prepared.putUrl, dataUri);
  await apiCompleteUpload({
    projectId: join.projectId,
    uploadCode: join.uploadCode,
    stampId: stamp.id,
  });
  await setUploadStatus(stampId, 'synced');
  failStreak = 0;
}

export async function drainProjectUploadQueue(): Promise<void> {
  if (draining) return;
  draining = true;
  try {
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id) break;
      try {
        await uploadOne(id);
      } catch (e) {
        await setUploadStatus(id, 'failed');
        failStreak += 1;
        if (failStreak === 3 && Platform.OS !== 'web') {
          const { Alert } = await import('react-native');
          Alert.alert('사업 올리기', mapProjectApiError(e));
        }
      }
    }
  } finally {
    draining = false;
  }
}

export async function retryProjectUpload(stampId: string): Promise<void> {
  await setUploadStatus(stampId, 'pending');
  enqueueProjectUpload(stampId);
}
