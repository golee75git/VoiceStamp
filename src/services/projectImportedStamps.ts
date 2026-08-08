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
