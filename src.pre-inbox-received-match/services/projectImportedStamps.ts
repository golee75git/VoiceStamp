import type { ManifestStamp } from './projectCollectApi';
import { buildImportGroupName, sanitizeProjectFolderPart, type ProjectImportFolderMode } from './projectCollectSettings';
import type { Stamp } from '../types/stamp';

/** Local stamps brought in via project 「내 폰으로」 (folder name match). */
export function listImportedStampsForProject(
  all: Stamp[],
  projectName: string,
  folderMode: ProjectImportFolderMode,
): Stamp[] {
  const folder = buildImportGroupName(projectName, folderMode);
  const token = sanitizeProjectFolderPart(projectName);
  const byFolder = all.filter((s) => {
    const path = s.imagePath.replace(/\\/g, '/');
    return path.includes('/' + folder + '/') || path.endsWith('/' + folder) || path.includes('/' + folder + '/');
  });
  if (byFolder.length > 0) return byFolder;

  return all.filter((s) => {
    const parts = s.imagePath.replace(/\\/g, '/').split('/');
    return parts.some(
      (seg) => seg === token || seg.endsWith('_' + token) || (token.length >= 2 && seg.includes(token)),
    );
  });
}

/** One row in the project inbox list (server + local import merge). */
export type MergedInboxItem = {
  stampId: string;
  title: string;
  uploadedAt?: number;
  uploadedByMark?: string | null;
  onServer: boolean;
  localImagePath: string | null;
};

/** Merge remote manifest with local imported stamps. Local-only rows stay after server delete. */
export function mergeInboxWithLocal(
  remote: ManifestStamp[],
  localImported: Stamp[],
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
    });
  }
  for (const s of localImported) {
    if (s.deletedAt) continue;
    const prev = byId.get(s.id);
    if (prev) {
      prev.localImagePath = s.imagePath;
      if (s.title) prev.title = s.title;
    } else {
      byId.set(s.id, {
        stampId: s.id,
        title: s.title || s.id,
        uploadedAt: s.createdAt,
        uploadedByMark: null,
        onServer: false,
        localImagePath: s.imagePath,
      });
    }
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
