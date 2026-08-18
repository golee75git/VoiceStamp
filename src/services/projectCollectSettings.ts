import { getDatabase } from '../db/database';

const KEYS = {
  enabled: 'project_collect_enabled',
  deviceId: 'device_id',
  joinId: 'project_join_id',
  joinName: 'project_join_name',
  joinCode: 'project_join_upload_code',
  joinAt: 'project_join_at',
  joinMark: 'project_join_mark',
  joinMarkPref: 'project_join_mark_pref',
  autoUpload: 'project_auto_upload',
  wifiOnly: 'project_wifi_only',
  owned: 'project_owned_json',
  joinHistory: 'project_join_history_json',
  importFolderMode: 'project_import_folder_mode',
  deleteAfterImport: 'project_delete_after_import',
  uploadStatus: 'project_upload_status_json',
  pinPrefix: 'project_pin_',
  /** Hide project-synced stamps from the main stamp list (default off). */
  hideSyncedFromList: 'project_hide_synced_from_list',
  /** Inbox/hub Excel preview image width in px (120–800). */
  inboxExcelPreviewWidth: 'project_inbox_excel_preview_width',
  /** Inbox/hub Excel cell font size preset. */
  inboxExcelFontSize: 'project_inbox_excel_font_size',
} as const;

export const DEFAULT_INBOX_EXCEL_PREVIEW_WIDTH = 240;
export const MIN_INBOX_EXCEL_PREVIEW_WIDTH = 120;
export const MAX_INBOX_EXCEL_PREVIEW_WIDTH = 800;

export type InboxExcelFontSize = 'small' | 'normal' | 'large';
export const DEFAULT_INBOX_EXCEL_FONT_SIZE: InboxExcelFontSize = 'normal';

export function sanitizeInboxExcelPreviewWidth(raw: unknown): number {
  const n =
    typeof raw === 'number'
      ? raw
      : Number.parseInt(String(raw ?? '').trim().replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(n)) return DEFAULT_INBOX_EXCEL_PREVIEW_WIDTH;
  return Math.min(
    MAX_INBOX_EXCEL_PREVIEW_WIDTH,
    Math.max(MIN_INBOX_EXCEL_PREVIEW_WIDTH, Math.round(n)),
  );
}

export function sanitizeInboxExcelFontSize(raw: unknown): InboxExcelFontSize {
  const v = String(raw ?? '').trim();
  if (v === 'small' || v === 'large' || v === 'normal') return v;
  return DEFAULT_INBOX_EXCEL_FONT_SIZE;
}

export function inboxExcelFontSizeToPt(size: InboxExcelFontSize): number {
  if (size === 'small') return 10;
  if (size === 'large') return 14;
  return 11;
}

/** Optional on-device label for project uploads (not a login id). Max 40. */
export function sanitizeJoinMark(raw: string): string {
  return String(raw || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);
}

export type ProjectImportFolderMode = 'date_name' | 'name_only';
export type ProjectUploadStatus = 'pending' | 'uploading' | 'synced' | 'failed' | 'received';

export const MAX_OWNED_PROJECTS = 20;

export type OwnedProject = {
  projectId: string;
  name: string;
  createdAt: number;
  expiresAt: number;
  uploadCode: string;
  /** Set when admin ends the project; kept until expiresAt. */
  closedAt?: number | null;
  /**
   * Admin-only note: company or person who created the project.
   * Stored on this device only — not sent to server / QR / join.
   */
  creatorLabel?: string | null;
  /** Built-in or custom source id last used for invite QR. */
  inviteTemplateSourceId?: string | null;
  /** Display name for invite template chip. */
  inviteTemplateName?: string | null;
  /** Server invite snapshot id for QR/share (`i=`). */
  inviteId?: string | null;
};

/** Past or current projects this device joined to upload. */
export type JoinedProjectHistory = {
  projectId: string;
  name: string;
  uploadCode: string;
  mark: string;
  joinedAt: number;
  /** Set when this device learned the project is closed or gone. */
  endedAt?: number | null;
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

/** Default false: synced uploads still appear in the main stamp list. */
export async function getHideProjectSyncedFromStampList(): Promise<boolean> {
  return (await getValue(KEYS.hideSyncedFromList)) === '1';
}

export async function setHideProjectSyncedFromStampList(on: boolean): Promise<void> {
  await setValue(KEYS.hideSyncedFromList, on ? '1' : '0');
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

export async function getInboxExcelPreviewWidth(): Promise<number> {
  const raw = await getValue(KEYS.inboxExcelPreviewWidth);
  return sanitizeInboxExcelPreviewWidth(raw);
}

export async function setInboxExcelPreviewWidth(widthPx: number): Promise<number> {
  const safe = sanitizeInboxExcelPreviewWidth(widthPx);
  await setValue(KEYS.inboxExcelPreviewWidth, String(safe));
  return safe;
}

export async function getInboxExcelFontSize(): Promise<InboxExcelFontSize> {
  return sanitizeInboxExcelFontSize(await getValue(KEYS.inboxExcelFontSize));
}

export async function setInboxExcelFontSize(size: InboxExcelFontSize): Promise<InboxExcelFontSize> {
  const safe = sanitizeInboxExcelFontSize(size);
  await setValue(KEYS.inboxExcelFontSize, safe);
  return safe;
}

export type ProjectJoinState = {
  projectId: string;
  name: string;
  uploadCode: string;
  joinedAt: number;
  /** Optional short label chosen by the joiner (empty if skipped). */
  mark: string;
} | null;

export async function getJoinMarkPref(): Promise<string> {
  return sanitizeJoinMark((await getValue(KEYS.joinMarkPref)) || '');
}

export async function setJoinMarkPref(mark: string): Promise<void> {
  const safe = sanitizeJoinMark(mark);
  if (safe) await setValue(KEYS.joinMarkPref, safe);
  else await deleteValue(KEYS.joinMarkPref);
}

export async function getProjectJoin(): Promise<ProjectJoinState> {
  const projectId = await getValue(KEYS.joinId);
  const uploadCode = await getValue(KEYS.joinCode);
  if (!projectId || !uploadCode) return null;
  const name = (await getValue(KEYS.joinName)) || projectId;
  const joinedAt = Number((await getValue(KEYS.joinAt)) || Date.now());
  const mark = sanitizeJoinMark((await getValue(KEYS.joinMark)) || '');
  return { projectId, name, uploadCode, joinedAt, mark };
}

export async function setProjectJoin(input: {
  projectId: string;
  name: string;
  uploadCode: string;
  mark?: string;
}): Promise<void> {
  const mark = sanitizeJoinMark(input.mark || '');
  const joinedAt = Date.now();
  await setValue(KEYS.joinId, input.projectId);
  await setValue(KEYS.joinName, input.name);
  await setValue(KEYS.joinCode, input.uploadCode);
  await setValue(KEYS.joinAt, String(joinedAt));
  if (mark) await setValue(KEYS.joinMark, mark);
  else await deleteValue(KEYS.joinMark);
  if (mark) await setValue(KEYS.joinMarkPref, mark);
  await upsertJoinedProjectHistory({
    projectId: input.projectId,
    name: input.name,
    uploadCode: input.uploadCode,
    mark,
    joinedAt,
  });
}

export async function clearProjectJoin(): Promise<void> {
  await deleteValue(KEYS.joinId);
  await deleteValue(KEYS.joinName);
  await deleteValue(KEYS.joinCode);
  await deleteValue(KEYS.joinAt);
  await deleteValue(KEYS.joinMark);
  try {
    const { restoreJoinFieldTemplateBackup } = await import('./projectInviteTemplate');
    await restoreJoinFieldTemplateBackup();
  } catch {
    // non-fatal
  }
}


export async function listJoinedProjectHistory(): Promise<JoinedProjectHistory[]> {
  const raw = await getValue(KEYS.joinHistory);
  let list: JoinedProjectHistory[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as JoinedProjectHistory[];
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }
  }
  const active = await getProjectJoin();
  if (active) {
    const exists = list.some((p) => p.projectId === active.projectId);
    if (!exists) {
      list = [
        {
          projectId: active.projectId,
          name: active.name,
          uploadCode: active.uploadCode,
          mark: active.mark || '',
          joinedAt: active.joinedAt,
        },
        ...list,
      ].slice(0, 20);
      await setValue(KEYS.joinHistory, JSON.stringify(list));
    }
  }
  return list;
}

export async function upsertJoinedProjectHistory(entry: JoinedProjectHistory): Promise<void> {
  const raw = await getValue(KEYS.joinHistory);
  let list: JoinedProjectHistory[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as JoinedProjectHistory[];
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }
  }
  const next: JoinedProjectHistory = {
    projectId: entry.projectId,
    name: entry.name,
    uploadCode: entry.uploadCode,
    mark: sanitizeJoinMark(entry.mark || ''),
    joinedAt: entry.joinedAt || Date.now(),
    endedAt: entry.endedAt ?? null,
  };
  const merged = [next, ...list.filter((p) => p.projectId !== next.projectId)].slice(0, 20);
  await setValue(KEYS.joinHistory, JSON.stringify(merged));
}

export async function markJoinedProjectEnded(projectId: string): Promise<void> {
  const id = String(projectId || '').trim();
  if (!id) return;
  const raw = await getValue(KEYS.joinHistory);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as JoinedProjectHistory[];
    if (!Array.isArray(parsed)) return;
    const now = Date.now();
    await setValue(
      KEYS.joinHistory,
      JSON.stringify(
        parsed.map((p) => (p.projectId === id ? { ...p, endedAt: now } : p)),
      ),
    );
  } catch {
    // ignore
  }
}

export function joinHistoryUploadBlocked(
  item: JoinedProjectHistory,
  ownedList: OwnedProject[],
  now = Date.now(),
): { closed: boolean; expired: boolean; blocked: boolean } {
  const mine = ownedList.find((p) => p.projectId === item.projectId);
  const expired = !!(mine && isOwnedExpired(mine, now));
  const closed = !!item.endedAt || !!(mine && mine.closedAt);
  return { closed, expired, blocked: closed || expired };
}

export async function removeJoinedProjectHistory(projectId: string): Promise<void> {
  const raw = await getValue(KEYS.joinHistory);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as JoinedProjectHistory[];
    if (!Array.isArray(parsed)) return;
    await setValue(
      KEYS.joinHistory,
      JSON.stringify(parsed.filter((p) => p.projectId !== projectId)),
    );
  } catch {
    // ignore
  }
}


async function readOwnedProjectRaw(): Promise<OwnedProject[]> {
  const raw = await getValue(KEYS.owned);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OwnedProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeOwnedProjects(list: OwnedProject[]): Promise<void> {
  await setValue(KEYS.owned, JSON.stringify(list.slice(0, MAX_OWNED_PROJECTS)));
}

export function isOwnedExpired(project: Pick<OwnedProject, 'expiresAt'>, now = Date.now()): boolean {
  return typeof project.expiresAt === 'number' && project.expiresAt <= now;
}

export async function listOwnedProjects(): Promise<OwnedProject[]> {
  return readOwnedProjectRaw();
}

export async function upsertOwnedProject(project: OwnedProject): Promise<void> {
  const list = await readOwnedProjectRaw();
  if (
    list.length >= MAX_OWNED_PROJECTS &&
    !list.some((p) => p.projectId === project.projectId)
  ) {
    const err = new Error('owned_full');
    (err as Error & { code?: string }).code = 'owned_full';
    throw err;
  }
  const next = [project, ...list.filter((p) => p.projectId !== project.projectId)];
  await writeOwnedProjects(next);
}

/** Mark project closed locally; PIN kept so inbox/excel still work until expiresAt. */
export async function markOwnedProjectClosed(projectId: string): Promise<void> {
  const list = await readOwnedProjectRaw();
  const next = list.map((p) =>
    p.projectId === projectId ? { ...p, closedAt: Date.now() } : p,
  );
  await writeOwnedProjects(next);
}

export async function removeOwnedProject(projectId: string): Promise<void> {
  const list = await readOwnedProjectRaw();
  await writeOwnedProjects(list.filter((p) => p.projectId !== projectId));
  await deleteValue(`${KEYS.pinPrefix}${projectId}`);
}

export async function setCollectorPin(projectId: string, pin: string): Promise<void> {
  await setValue(`${KEYS.pinPrefix}${projectId}`, pin);
}

export async function getCollectorPin(projectId: string): Promise<string | null> {
  return getValue(`${KEYS.pinPrefix}${projectId}`);
}

export type JoinSendWay = 'album' | 'shot';

export type ProjectUploadRecord = {
  status: ProjectUploadStatus;
  /** Join project id when known (older entries may omit). */
  projectId?: string | null;
  /** How this device queued the send: album pick vs camera. Older rows omit. */
  joinSendWay?: JoinSendWay | null;
};

function sanitizeJoinSendWay(value: unknown): JoinSendWay | null {
  if (value === 'album' || value === 'shot') {
    return value;
  }
  return null;
}

function normalizeUploadRecord(raw: unknown): ProjectUploadRecord | null {
  if (typeof raw === 'string') {
    return { status: raw as ProjectUploadStatus };
  }
  if (raw && typeof raw === 'object' && typeof (raw as { status?: unknown }).status === 'string') {
    const row = raw as {
      status: ProjectUploadStatus;
      projectId?: string | null;
      joinSendWay?: unknown;
    };
    return {
      status: row.status,
      projectId: row.projectId ?? null,
      joinSendWay: sanitizeJoinSendWay(row.joinSendWay),
    };
  }
  return null;
}

async function readUploadRecordMap(): Promise<Record<string, ProjectUploadRecord>> {
  const raw = await getValue(KEYS.uploadStatus);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, ProjectUploadRecord> = {};
    for (const [id, value] of Object.entries(parsed)) {
      const entry = normalizeUploadRecord(value);
      if (entry) {
        out[id] = entry;
      }
    }
    return out;
  } catch {
    return {};
  }
}

async function writeUploadRecordMap(map: Record<string, ProjectUploadRecord>): Promise<void> {
  const keys = Object.keys(map);
  if (keys.length > 400) {
    for (const k of keys.slice(0, keys.length - 300)) {
      delete map[k];
    }
  }
  await setValue(KEYS.uploadStatus, JSON.stringify(map));
}

export async function getUploadStatusMap(): Promise<Record<string, ProjectUploadStatus>> {
  const records = await readUploadRecordMap();
  const out: Record<string, ProjectUploadStatus> = {};
  for (const [id, row] of Object.entries(records)) {
    out[id] = row.status;
  }
  return out;
}

export async function getUploadRecordMap(): Promise<Record<string, ProjectUploadRecord>> {
  return readUploadRecordMap();
}

export async function setUploadStatus(
  stampId: string,
  status: ProjectUploadStatus,
  projectId?: string | null,
  joinSendWay?: JoinSendWay | null,
): Promise<void> {
  const map = await readUploadRecordMap();
  const prev = map[stampId];
  const way = sanitizeJoinSendWay(joinSendWay) ?? prev?.joinSendWay ?? null;
  map[stampId] = {
    status,
    projectId: projectId ?? prev?.projectId ?? null,
    joinSendWay: way,
  };
  await writeUploadRecordMap(map);
}

/** Stamp ids uploaded (any status) for a joined project. */
export async function listSentStampIdsForProject(projectId: string): Promise<string[]> {
  const pid = projectId.trim();
  if (!pid) return [];
  const map = await readUploadRecordMap();
  return Object.entries(map)
    .filter(([, row]) => row.projectId === pid)
    .map(([id]) => id);
}

/** Stamp ids brought in via project inbox import for an owned project. */
export async function listReceivedStampIdsForProject(projectId: string): Promise<string[]> {
  const pid = projectId.trim();
  if (!pid) return [];
  const map = await readUploadRecordMap();
  return Object.entries(map)
    .filter(([, row]) => row.status === 'received' && row.projectId === pid)
    .map(([id]) => id);
}

/** Mark a stamp brought in via project inbox import. Does not override active uploads. */
export async function markStampReceivedFromProject(
  stampId: string,
  projectId?: string | null,
): Promise<void> {
  const map = await getUploadStatusMap();
  const cur = map[stampId];
  if (cur === 'synced' || cur === 'pending' || cur === 'uploading') return;
  await setUploadStatus(stampId, 'received', projectId ?? null);
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
