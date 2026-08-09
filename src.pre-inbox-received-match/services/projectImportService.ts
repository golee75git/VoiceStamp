import * as FileSystem from 'expo-file-system/legacy';

import { persistImage, resolveImageUri } from './fileService';
import { ensureStampThumb } from './stampThumb';
import { insertStamp, getStampById, setStampUploadedByMarkIfEmpty } from './stampRepository';
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

function trimJoinMark(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim().replace(/\s+/g, ' ').slice(0, 40);
  return s || null;
}

export async function importProjectStampToPhone(input: {
  project: OwnedProject;
  collectorPin: string;
  stampId: string;
}): Promise<{ stamp: Stamp | null; skipped: boolean }> {
  const existing = await getStampById(input.stampId);
  if (existing && !existing.deletedAt) {
    await markStampReceivedFromProject(input.stampId);
    if (!existing.uploadedByMark) {
      try {
        const { meta } = await apiDownloadUrl({
          projectId: input.project.projectId,
          collectorPin: input.collectorPin,
          stampId: input.stampId,
        });
        const filled = await setStampUploadedByMarkIfEmpty(
          input.stampId,
          trimJoinMark(meta.uploadedByMark),
        );
        if (filled) {
          const refreshed = await getStampById(input.stampId);
          return { stamp: refreshed || existing, skipped: true };
        }
      } catch {
        // keep existing without mark
      }
    }
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

  const trimLabel = (v: unknown) =>
    v != null ? String(v).trim().slice(0, 20) || null : null;
  const trimExtra = (v: unknown) =>
    v != null ? String(v).trim().slice(0, 500) || null : null;

  let titleFieldLabel = trimLabel(meta.titleFieldLabel);
  let placeFieldLabel = trimLabel(meta.placeFieldLabel);
  let memoFieldLabel = trimLabel(meta.memoFieldLabel);
  let extra1FieldLabel = trimLabel(meta.extra1FieldLabel);
  let extra2FieldLabel = trimLabel(meta.extra2FieldLabel);
  let extra3FieldLabel = trimLabel(meta.extra3FieldLabel);
  const templateId =
    meta.templateId != null && String(meta.templateId).trim()
      ? String(meta.templateId).trim().slice(0, 64)
      : null;

  if (
    templateId &&
    !titleFieldLabel &&
    !placeFieldLabel &&
    !memoFieldLabel &&
    !extra1FieldLabel
  ) {
    try {
      const { findStampFieldTemplate } = await import('./stampFieldTemplates');
      const tmpl = await findStampFieldTemplate(templateId);
      if (tmpl) {
        titleFieldLabel = tmpl.labels.titleFieldLabel;
        placeFieldLabel = tmpl.labels.placeFieldLabel;
        memoFieldLabel = tmpl.labels.memoFieldLabel;
        extra1FieldLabel = tmpl.labels.extra1FieldLabel;
        extra2FieldLabel = tmpl.labels.extra2FieldLabel;
        extra3FieldLabel = tmpl.labels.extra3FieldLabel;
      }
    } catch {
      // keep nulls
    }
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
    extra1: trimExtra(meta.extra1),
    extra2: trimExtra(meta.extra2),
    extra3: trimExtra(meta.extra3),
    sourceUrl: null,
    templateId,
    titleFieldLabel,
    placeFieldLabel,
    memoFieldLabel,
    extra1FieldLabel,
    extra2FieldLabel,
    extra3FieldLabel,
    parentId: null,
    uploadedByMark: trimJoinMark(meta.uploadedByMark),
  };

  const again = await getStampById(id);
  if (again && !again.deletedAt) {
    await markStampReceivedFromProject(id);
    await setStampUploadedByMarkIfEmpty(id, trimJoinMark(meta.uploadedByMark));
    const refreshed = await getStampById(id);
    return { stamp: refreshed || again, skipped: true };
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
