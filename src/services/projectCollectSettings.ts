import { getDatabase } from '../db/database';

const KEYS = {
  enabled: 'project_collect_enabled',
  deviceId: 'device_id',
  joinId: 'project_join_id',
  joinName: 'project_join_name',
  joinCode: 'project_join_upload_code',
  joinAt: 'project_join_at',
  autoUpload: 'project_auto_upload',
  wifiOnly: 'project_wifi_only',
  owned: 'project_owned_json',
  importFolderMode: 'project_import_folder_mode',
  deleteAfterImport: 'project_delete_after_import',
  uploadStatus: 'project_upload_status_json',
  pinPrefix: 'project_pin_',
} as const;

export type ProjectImportFolderMode = 'date_name' | 'name_only';
export type ProjectUploadStatus = 'pending' | 'uploading' | 'synced' | 'failed';

export type OwnedProject = {
  projectId: string;
  name: string;
  createdAt: number;
  expiresAt: number;
  uploadCode: string;
};

async function getValue(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

async function setValue(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

async function deleteValue(key: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM app_settings WHERE key = ?', [key]);
}

function newDeviceId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `d-${Date.now().toString(36)}-${rand}`;
}

export async function getOrCreateDeviceId(): Promise<string> {
  const existing = await getValue(KEYS.deviceId);
  if (existing) return existing;
  const id = newDeviceId();
  await setValue(KEYS.deviceId, id);
  return id;
}

export async function getProjectCollectEnabled(): Promise<boolean> {
  return (await getValue(KEYS.enabled)) === '1';
}

export async function setProjectCollectEnabled(on: boolean): Promise<void> {
  await setValue(KEYS.enabled, on ? '1' : '0');
}

export async function getProjectAutoUpload(): Promise<boolean> {
  const v = await getValue(KEYS.autoUpload);
  return v !== '0';
}

export async function setProjectAutoUpload(on: boolean): Promise<void> {
  await setValue(KEYS.autoUpload, on ? '1' : '0');
}

export async function getProjectWifiOnly(): Promise<boolean> {
  return (await getValue(KEYS.wifiOnly)) === '1';
}

export async function setProjectWifiOnly(on: boolean): Promise<void> {
  await setValue(KEYS.wifiOnly, on ? '1' : '0');
}

export async function getProjectImportFolderMode(): Promise<ProjectImportFolderMode> {
  const v = await getValue(KEYS.importFolderMode);
  return v === 'name_only' ? 'name_only' : 'date_name';
}

export async function setProjectImportFolderMode(mode: ProjectImportFolderMode): Promise<void> {
  await setValue(KEYS.importFolderMode, mode);
}

export async function getProjectDeleteAfterImport(): Promise<boolean> {
  const v = await getValue(KEYS.deleteAfterImport);
  return v !== '0';
}

export async function setProjectDeleteAfterImport(on: boolean): Promise<void> {
  await setValue(KEYS.deleteAfterImport, on ? '1' : '0');
}

export type ProjectJoinState = {
  projectId: string;
  name: string;
  uploadCode: string;
  joinedAt: number;
} | null;

export async function getProjectJoin(): Promise<ProjectJoinState> {
  const projectId = await getValue(KEYS.joinId);
  const uploadCode = await getValue(KEYS.joinCode);
  if (!projectId || !uploadCode) return null;
  const name = (await getValue(KEYS.joinName)) || projectId;
  const joinedAt = Number((await getValue(KEYS.joinAt)) || Date.now());
  return { projectId, name, uploadCode, joinedAt };
}

export async function setProjectJoin(input: {
  projectId: string;
  name: string;
  uploadCode: string;
}): Promise<void> {
  await setValue(KEYS.joinId, input.projectId);
  await setValue(KEYS.joinName, input.name);
  await setValue(KEYS.joinCode, input.uploadCode);
  await setValue(KEYS.joinAt, String(Date.now()));
}

export async function clearProjectJoin(): Promise<void> {
  await deleteValue(KEYS.joinId);
  await deleteValue(KEYS.joinName);
  await deleteValue(KEYS.joinCode);
  await deleteValue(KEYS.joinAt);
}

export async function listOwnedProjects(): Promise<OwnedProject[]> {
  const raw = await getValue(KEYS.owned);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OwnedProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function upsertOwnedProject(project: OwnedProject): Promise<void> {
  const list = await listOwnedProjects();
  const next = [project, ...list.filter((p) => p.projectId !== project.projectId)];
  await setValue(KEYS.owned, JSON.stringify(next.slice(0, 20)));
}

export async function removeOwnedProject(projectId: string): Promise<void> {
  const list = await listOwnedProjects();
  await setValue(
    KEYS.owned,
    JSON.stringify(list.filter((p) => p.projectId !== projectId)),
  );
  await deleteValue(`${KEYS.pinPrefix}${projectId}`);
}

export async function setCollectorPin(projectId: string, pin: string): Promise<void> {
  await setValue(`${KEYS.pinPrefix}${projectId}`, pin);
}

export async function getCollectorPin(projectId: string): Promise<string | null> {
  return getValue(`${KEYS.pinPrefix}${projectId}`);
}

export async function getUploadStatusMap(): Promise<Record<string, ProjectUploadStatus>> {
  const raw = await getValue(KEYS.uploadStatus);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, ProjectUploadStatus>;
  } catch {
    return {};
  }
}

export async function setUploadStatus(
  stampId: string,
  status: ProjectUploadStatus,
): Promise<void> {
  const map = await getUploadStatusMap();
  map[stampId] = status;
  const keys = Object.keys(map);
  if (keys.length > 400) {
    for (const k of keys.slice(0, keys.length - 300)) {
      delete map[k];
    }
  }
  await setValue(KEYS.uploadStatus, JSON.stringify(map));
}

export function sanitizeProjectFolderPart(name: string): string {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 40) || '사업';
}

export function buildImportGroupName(
  projectName: string,
  mode: ProjectImportFolderMode,
  at = Date.now(),
): string {
  const safe = sanitizeProjectFolderPart(projectName);
  if (mode === 'name_only') return safe;
  const d = new Date(at);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}_${safe}`;
}
