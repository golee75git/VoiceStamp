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
    extra1: meta.extra1 != null ? String(meta.extra1).trim().slice(0, 500) || null : null,
    extra2: meta.extra2 != null ? String(meta.extra2).trim().slice(0, 500) || null : null,
    extra3: meta.extra3 != null ? String(meta.extra3).trim().slice(0, 500) || null : null,
    sourceUrl: null,
    templateId:
      meta.templateId != null && String(meta.templateId).trim()
        ? String(meta.templateId).trim().slice(0, 64)
        : null,
    titleFieldLabel:
      meta.titleFieldLabel != null ? String(meta.titleFieldLabel).trim().slice(0, 20) || null : null,
    placeFieldLabel:
      meta.placeFieldLabel != null ? String(meta.placeFieldLabel).trim().slice(0, 20) || null : null,
    memoFieldLabel:
      meta.memoFieldLabel != null ? String(meta.memoFieldLabel).trim().slice(0, 20) || null : null,
    extra1FieldLabel:
      meta.extra1FieldLabel != null ? String(meta.extra1FieldLabel).trim().slice(0, 20) || null : null,
    extra2FieldLabel:
      meta.extra2FieldLabel != null ? String(meta.extra2FieldLabel).trim().slice(0, 20) || null : null,
    extra3FieldLabel:
      meta.extra3FieldLabel != null ? String(meta.extra3FieldLabel).trim().slice(0, 20) || null : null,
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
