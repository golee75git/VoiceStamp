import { Platform } from 'react-native';

import { readImageDataUriForPdf } from './pdfImageForExport';
import {
  apiUploadStamp,
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

function dataUriToBase64(dataUri: string): string {
  const i = dataUri.indexOf('base64,');
  return i >= 0 ? dataUri.slice(i + 7) : '';
}

export function enqueueProjectUpload(stampId: string): void {
  if (!queue.includes(stampId)) {
    queue.push(stampId);
  }
  void drainProjectUploadQueue();
}

export async function scheduleProjectUploadAfterSave(stamp: Stamp): Promise<void> {
  try {
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
  const imageBase64 = dataUriToBase64(dataUri);
  await apiUploadStamp({
    projectId: join.projectId,
    uploadCode: join.uploadCode,
    stampId: stamp.id,
    imageBase64,
    meta: {
      uploadedByDeviceId: deviceId,
      title: stamp.title,
      memo: stamp.memo,
      placeLabel: stamp.placeLabel,
      floor: stamp.floor,
      latitude: stamp.latitude,
      longitude: stamp.longitude,
      createdAt: stamp.createdAt,
      localGroupName: null,
    },
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
