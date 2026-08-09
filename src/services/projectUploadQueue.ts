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
    await setUploadStatus(stamp.id, 'pending', join.projectId);
    enqueueProjectUpload(stamp.id);
  } catch {
    // non-fatal
  }
}

function dataUriToBytes(dataUri: string): Uint8Array {
  const comma = dataUri.indexOf(',');
  if (comma < 0 || !dataUri.startsWith('data:')) {
    const err = new Error('bad_image');
    (err as Error & { code?: string }).code = 'bad_image';
    throw err;
  }
  const meta = dataUri.slice(5, comma);
  const payload = dataUri.slice(comma + 1);
  if (!/;base64/i.test(meta) || !payload) {
    const err = new Error('bad_image');
    (err as Error & { code?: string }).code = 'bad_image';
    throw err;
  }
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function putImageToPresignedUrl(
  putUrl: string,
  dataUri: string,
  contentType: string | null,
): Promise<void> {
  // Android native fetch rejects data: URLs; decode base64 locally instead.
  const body = dataUriToBytes(dataUri);
  if (body.byteLength < 32 || body.byteLength > 2_800_000) {
    const err = new Error('bad_image');
    (err as Error & { code?: string }).code = 'bad_image';
    throw err;
  }
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const putRes = await fetch(putUrl, {
    method: 'PUT',
    headers,
    body,
  });
  if (!putRes.ok) {
    const err = new Error('put_failed');
    (err as Error & { code?: string; detail?: string }).code = 'put_failed';
    (err as Error & { detail?: string }).detail = String(putRes.status);
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

  await setUploadStatus(stampId, 'uploading', join.projectId);
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
      extra1: stamp.extra1 || null,
      extra2: stamp.extra2 || null,
      extra3: stamp.extra3 || null,
      titleFieldLabel: stamp.titleFieldLabel || null,
      placeFieldLabel: stamp.placeFieldLabel || null,
      memoFieldLabel: stamp.memoFieldLabel || null,
      extra1FieldLabel: stamp.extra1FieldLabel || null,
      extra2FieldLabel: stamp.extra2FieldLabel || null,
      extra3FieldLabel: stamp.extra3FieldLabel || null,
    },
  });

  const contentType = prepared.contentType || 'image/jpeg';
  try {
    await putImageToPresignedUrl(prepared.putUrl, dataUri, contentType);
  } catch (first) {
    const code = first instanceof Error ? (first as Error & { code?: string }).code : '';
    if (code === 'put_failed' && prepared.putUrlPlain) {
      await putImageToPresignedUrl(prepared.putUrlPlain, dataUri, null);
    } else {
      throw first;
    }
  }

  await apiCompleteUpload({
    projectId: join.projectId,
    uploadCode: join.uploadCode,
    stampId: stamp.id,
  });
  await setUploadStatus(stampId, 'synced', join.projectId);
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
        const join = await getProjectJoin();
        await setUploadStatus(id, 'failed', join?.projectId ?? null);
        failStreak += 1;
        if (Platform.OS !== 'web' && failStreak <= 2) {
          const { Alert } = await import('react-native');
          const detail =
            e instanceof Error && (e as Error & { detail?: string }).detail
              ? ` (${(e as Error & { detail?: string }).detail})`
              : '';
          Alert.alert('사업 올리기', mapProjectApiError(e) + detail);
        }
      }
    }
  } finally {
    draining = false;
  }
}

export async function retryProjectUpload(stampId: string): Promise<void> {
  const join = await getProjectJoin();
  await setUploadStatus(stampId, 'pending', join?.projectId ?? null);
  enqueueProjectUpload(stampId);
}
