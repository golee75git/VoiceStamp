/**
 * Apply / restore save-field templates when joining a project invite.
 * Uses existing stampFieldTemplates + settings only (no new deps).
 */
import type { FieldLabels } from './fieldLabels';
import {
  DEFAULT_FIELD_EXTRA1_LABEL,
  DEFAULT_FIELD_EXTRA2_LABEL,
  DEFAULT_FIELD_EXTRA3_LABEL,
  DEFAULT_FIELD_MEMO_LABEL,
  DEFAULT_FIELD_PLACE_LABEL,
  DEFAULT_FIELD_TITLE_LABEL,
  resolveFieldLabels,
} from './fieldLabels';
import {
  getExtra1FieldLabel,
  getExtra2FieldLabel,
  getExtra3FieldLabel,
  getMemoFieldLabel,
  getPlaceFieldLabel,
  getTitleFieldLabel,
  setExtra1FieldLabel,
  setExtra2FieldLabel,
  setExtra3FieldLabel,
  setMemoFieldLabel,
  setPlaceFieldLabel,
  setTitleFieldLabel,
} from './settingsService';
import {
  applyStampFieldTemplate,
  applyStampFieldTemplateObject,
  findStampFieldTemplate,
  getActiveStampFieldTemplateStatus,
  STAMP_FIELD_TEMPLATES,
  type FieldPlaceholders,
  type StampFieldTemplate,
} from './stampFieldTemplates';
import { getDatabase } from '../db/database';

const BACKUP_KEY = 'project_join_field_backup_json';
const JOIN_TEMPLATE_ID_KEY = 'project_join_invite_template_id';

export type InviteFieldTemplatePayload = {
  sourceId: string;
  name: string;
  labels: FieldLabels;
  placeholders: FieldPlaceholders;
};

type FieldBackup = {
  activeId: string | null;
  labels: FieldLabels;
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

function sanitizeTemplateId(raw: string | null | undefined): string | null {
  const s = String(raw || '')
    .trim()
    .slice(0, 64);
  return s || null;
}

export function isBuiltinStampFieldTemplateId(id: string): boolean {
  return STAMP_FIELD_TEMPLATES.some((t) => t.id === id);
}

export function toInviteFieldTemplatePayload(t: StampFieldTemplate): InviteFieldTemplatePayload {
  return {
    sourceId: t.id,
    name: t.name,
    labels: { ...t.labels },
    placeholders: { ...t.placeholders },
  };
}

async function readCurrentLabels(): Promise<FieldLabels> {
  return resolveFieldLabels({
    titleFieldLabel: await getTitleFieldLabel(),
    placeFieldLabel: await getPlaceFieldLabel(),
    memoFieldLabel: await getMemoFieldLabel(),
    extra1FieldLabel: await getExtra1FieldLabel(),
    extra2FieldLabel: await getExtra2FieldLabel(),
    extra3FieldLabel: await getExtra3FieldLabel(),
  });
}

async function writeLabels(labels: FieldLabels): Promise<void> {
  await setTitleFieldLabel(labels.titleFieldLabel);
  await setPlaceFieldLabel(labels.placeFieldLabel);
  await setMemoFieldLabel(labels.memoFieldLabel);
  await setExtra1FieldLabel(labels.extra1FieldLabel);
  await setExtra2FieldLabel(labels.extra2FieldLabel);
  await setExtra3FieldLabel(labels.extra3FieldLabel);
}

/** Keep one personal baseline; on project switch, restore it before the next invite apply. */
async function preparePersonalBaselineBeforeInviteApply(): Promise<void> {
  const existing = await getValue(BACKUP_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as FieldBackup;
      const labels = resolveFieldLabels(parsed.labels);
      await writeLabels(labels);
      if (parsed.activeId && (await findStampFieldTemplate(parsed.activeId))) {
        await applyStampFieldTemplate(parsed.activeId);
      }
    } catch {
      // ignore broken backup; still allow invite apply
    }
    return;
  }
  const status = await getActiveStampFieldTemplateStatus();
  const backup: FieldBackup = {
    activeId: status.templateId,
    labels: await readCurrentLabels(),
  };
  await setValue(BACKUP_KEY, JSON.stringify(backup));
}

/** Restore personal field labels after leaving a project join. */
export async function restoreJoinFieldTemplateBackup(): Promise<void> {
  const raw = await getValue(BACKUP_KEY);
  await deleteValue(JOIN_TEMPLATE_ID_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as FieldBackup;
    await writeLabels(resolveFieldLabels(parsed.labels));
    if (parsed.activeId && (await findStampFieldTemplate(parsed.activeId))) {
      await applyStampFieldTemplate(parsed.activeId);
    }
  } catch {
    // ignore
  }
  await deleteValue(BACKUP_KEY);
}

export async function getJoinInviteTemplateId(): Promise<string | null> {
  return sanitizeTemplateId(await getValue(JOIN_TEMPLATE_ID_KEY));
}

/**
 * Apply invite template for a new/changed join.
 * Prefer server snapshot; else built-in `t=`.
 */
export async function applyInviteTemplateForJoin(input: {
  fieldTemplate?: InviteFieldTemplatePayload | null;
  templateId?: string | null;
}): Promise<string | null> {
  await preparePersonalBaselineBeforeInviteApply();

  const snap = input.fieldTemplate;
  if (snap && snap.name) {
    const labels = resolveFieldLabels(snap.labels || {
      titleFieldLabel: DEFAULT_FIELD_TITLE_LABEL,
      placeFieldLabel: DEFAULT_FIELD_PLACE_LABEL,
      memoFieldLabel: DEFAULT_FIELD_MEMO_LABEL,
      extra1FieldLabel: DEFAULT_FIELD_EXTRA1_LABEL,
      extra2FieldLabel: DEFAULT_FIELD_EXTRA2_LABEL,
      extra3FieldLabel: DEFAULT_FIELD_EXTRA3_LABEL,
    });
    const sourceId = sanitizeTemplateId(snap.sourceId);
    if (sourceId && isBuiltinStampFieldTemplateId(sourceId)) {
      await applyStampFieldTemplate(sourceId);
      await setValue(JOIN_TEMPLATE_ID_KEY, sourceId);
      return sourceId;
    }
    const id = sourceId || 'invite-applied';
    await applyStampFieldTemplateObject({
      id,
      name: String(snap.name).trim().slice(0, 40) || '초대 템플릿',
      labels,
      placeholders: snap.placeholders,
      custom: true,
    });
    await setValue(JOIN_TEMPLATE_ID_KEY, id);
    return id;
  }

  const tid = sanitizeTemplateId(input.templateId);
  if (tid && isBuiltinStampFieldTemplateId(tid)) {
    await applyStampFieldTemplate(tid);
    await setValue(JOIN_TEMPLATE_ID_KEY, tid);
    return tid;
  }

  await deleteValue(JOIN_TEMPLATE_ID_KEY);
  return null;
}
