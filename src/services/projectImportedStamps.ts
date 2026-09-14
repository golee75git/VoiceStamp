import type { ManifestStamp } from './projectCollectApi';
import { sanitizeStampFileBaseName } from './fileService';
import {
  buildImportGroupName,
  listReceivedStampIdsForProject,
  sanitizeProjectFolderPart,
  type ProjectImportFolderMode,
} from './projectCollectSettings';
import type { Stamp } from '../types/stamp';

/** Legacy path guess when received markers lack projectId (pre-fix imports). */
function listImportedStampsByFolderPath(
  all: Stamp[],
  projectName: string,
  folderMode: ProjectImportFolderMode,
): Stamp[] {
  const folderLogical = buildImportGroupName(projectName, folderMode);
  const folderOnDisk = sanitizeStampFileBaseName(folderLogical);
  const folders = [...new Set([folderLogical, folderOnDisk].filter(Boolean))];
  const byFolder = all.filter((s) => {
    if (s.deletedAt) return false;
    const path = s.imagePath.replace(/\\/g, '/');
    return folders.some(
      (folder) =>
        path.includes('/' + folder + '/') ||
        path.endsWith('/' + folder) ||
        path.includes('/' + folder + '/'),
    );
  });
  if (byFolder.length > 0) return byFolder;

  const tokenLogical = sanitizeProjectFolderPart(projectName);
  const tokenOnDisk = sanitizeStampFileBaseName(tokenLogical);
  const tokens = [...new Set([tokenLogical, tokenOnDisk].filter((t) => t.length >= 2))];
  return all.filter((s) => {
    if (s.deletedAt) return false;
    const parts = s.imagePath.replace(/\\/g, '/').split('/');
    return parts.some((seg) =>
      tokens.some(
        (token) => seg === token || seg.endsWith('_' + token) || seg.includes(token),
      ),
    );
  });
}

/** Local stamps brought in via project 「내 폰으로」 (received+projectId, path fallback). */
export async function listImportedStampsForProject(
  all: Stamp[],
  projectId: string,
  projectName: string,
  folderMode: ProjectImportFolderMode,
): Promise<Stamp[]> {
  const want = new Set(await listReceivedStampIdsForProject(projectId));
  const byMark = all.filter((s) => !s.deletedAt && want.has(s.id));
  const byPath = listImportedStampsByFolderPath(all, projectName, folderMode);
  if (byMark.length === 0) return byPath;
  if (byPath.length === 0) return byMark;
  const merged = new Map<string, Stamp>();
  for (const s of byMark) merged.set(s.id, s);
  for (const s of byPath) merged.set(s.id, s);
  return [...merged.values()];
}

/** One row in the project inbox list (server + local import merge). */
export type InboxLocalKind = 'imported' | 'on_device';

export type MergedInboxItem = {
  stampId: string;
  title: string;
  uploadedAt?: number;
  uploadedByMark?: string | null;
  onServer: boolean;
  localImagePath: string | null;
  /** imported = 「내 폰으로」. on_device = same id already on this phone. */
  localKind?: InboxLocalKind | null;
};

/** Merge remote manifest with local imported stamps. Local-only rows stay after server delete. */
export function mergeInboxWithLocal(
  remote: ManifestStamp[],
  localImported: Stamp[],
  onDevice: Stamp[] = [],
): MergedInboxItem[] {
  const byId = new Map<string, MergedInboxItem>();
  for (const r of remote) {
    byId.set(r.stampId, {
      stampId: r.stampId,
      title: String(r.title || r.stampId),
      uploadedAt: r.uploadedAt,
      uploadedByMark: r.uploadedByMark ?? null,
      onServer: true,
      localImagePath: null,
      localKind: null,
    });
  }
  for (const s of localImported) {
    if (s.deletedAt) continue;
    const prev = byId.get(s.id);
    if (prev) {
      prev.localImagePath = s.imagePath;
      prev.localKind = 'imported';
      if (s.title) prev.title = s.title;
    } else {
      byId.set(s.id, {
        stampId: s.id,
        title: s.title || s.id,
        uploadedAt: s.createdAt,
        uploadedByMark: null,
        onServer: false,
        localImagePath: s.imagePath,
        localKind: 'imported',
      });
    }
  }
  for (const s of onDevice) {
    if (s.deletedAt) continue;
    const prev = byId.get(s.id);
    if (!prev || prev.localImagePath) continue;
    prev.localImagePath = s.imagePath;
    prev.localKind = 'on_device';
    if (s.title) prev.title = s.title;
  }
  return [...byId.values()].sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
}

export function buildJoinAwareDefaultTitle(projectName: string, timestamp: number, formatDefault: (t: number) => string): string {
  const base = formatDefault(timestamp).trim();
  const label = String(projectName || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);
  if (!label) return base;
  if (!base) return label;
  if (base.startsWith(label)) return base;
  return `${label} ${base}`;
}
