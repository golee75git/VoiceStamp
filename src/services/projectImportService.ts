import * as FileSystem from 'expo-file-system/legacy';

import { persistImage, resolveImageUri } from './fileService';
import { ensureStampThumb } from './stampThumb';
import { insertStamp, getStampById } from './stampRepository';
import { sanitizeStampFloor } from './stampFloor';
import {
  apiDownloadUrl,
  apiImportAck,
  mapProjectApiError,
} from './projectCollectApi';
import {
  buildImportGroupName,
  getProjectDeleteAfterImport,
  getProjectImportFolderMode,
  markStampReceivedFromProject,
  type OwnedProject,
} from './projectCollectSettings';
import type { Stamp } from '../types/stamp';

export async function importProjectStampToPhone(input: {
  project: OwnedProject;
  collectorPin: string;
  stampId: string;
}): Promise<{ stamp: Stamp | null; skipped: boolean }> {
  const existing = await getStampById(input.stampId);
  if (existing && !existing.deletedAt) {
    await markStampReceivedFromProject(input.stampId);
    return { stamp: existing, skipped: true };
  }

  const { meta, url } = await apiDownloadUrl({
    projectId: input.project.projectId,
    collectorPin: input.collectorPin,
    stampId: input.stampId,
  });

  const mode = await getProjectImportFolderMode();
  const groupName = buildImportGroupName(input.project.name, mode);
  const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  if (!cacheDir) {
    throw new Error('cache_unavailable');
  }
  const tempUri = `${cacheDir}project-import-${input.stampId}.jpg`;
  const downloaded = await FileSystem.downloadAsync(url, tempUri);
  if (downloaded.status < 200 || downloaded.status >= 300) {
    const err = new Error('stamp_not_found');
    (err as Error & { code?: string }).code = 'stamp_not_found';
    throw err;
  }

  const title = String(meta.title || input.stampId).slice(0, 200) || '제목 없음';
  const id = input.stampId;
  const imagePath = await persistImage(downloaded.uri, title, id, groupName);
  const now = Date.now();
  const stamp: Stamp = {
    id,
    title,
    memo: String(meta.memo || ''),
    imagePath,
    createdAt: typeof meta.createdAt === 'number' ? meta.createdAt : now,
    updatedAt: now,
    galleryAssetId: null,
    latitude: typeof meta.latitude === 'number' ? meta.latitude : null,
    longitude: typeof meta.longitude === 'number' ? meta.longitude : null,
    floor: sanitizeStampFloor(meta.floor != null ? String(meta.floor) : null),
    placeLabel: meta.placeLabel != null ? String(meta.placeLabel) : null,
    extra1: null,
    extra2: null,
    extra3: null,
    sourceUrl: null,
    templateId:
      meta.templateId != null && String(meta.templateId).trim()
        ? String(meta.templateId).trim().slice(0, 64)
        : null,
    titleFieldLabel: null,
    placeFieldLabel: null,
    memoFieldLabel: null,
    extra1FieldLabel: null,
    extra2FieldLabel: null,
    extra3FieldLabel: null,
    parentId: null,
  };

  const again = await getStampById(id);
  if (again && !again.deletedAt) {
    await markStampReceivedFromProject(id);
    return { stamp: again, skipped: true };
  }
  await insertStamp(stamp);
  void ensureStampThumb(id, resolveImageUri(imagePath)).catch(() => {});
  await markStampReceivedFromProject(id);

  if (await getProjectDeleteAfterImport()) {
    try {
      await apiImportAck({
        projectId: input.project.projectId,
        collectorPin: input.collectorPin,
        stampId: input.stampId,
      });
    } catch {
      // local import succeeded
    }
  }

  return { stamp, skipped: false };
}

export { mapProjectApiError };
