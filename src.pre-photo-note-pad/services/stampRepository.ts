import { getDatabase } from '../db/database';
import { sanitizeStampFloor } from './stampFloor';
import { resolveFieldLabels, type FieldLabels } from './fieldLabels';
import { normalizeHttpUrl } from './qrUrlExtractService';
import type { Stamp, StampRow } from '../types/stamp';

const STAMP_COLUMNS =
  'id, title, memo, image_path, created_at, updated_at, deleted_at, gallery_asset_id, latitude, longitude, floor, place_label, extra1, extra2, extra3, source_url, template_id, title_field_label, place_field_label, memo_field_label, extra1_field_label, extra2_field_label, extra3_field_label, parent_id, uploaded_by_mark';

function normalizeOptionalText(value?: string | null): string | null {
  return value?.trim() || null;
}

function normalizeTemplateId(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/i.test(trimmed)) return null;
  return trimmed.slice(0, 64);
}

/** Stamp id used as follow-up parent (same charset as generateId). */
function normalizeParentId(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/i.test(trimmed)) return null;
  return trimmed.slice(0, 80);
}

function normalizeSourceUrl(value?: string | null): string | null {
  if (value == null || !String(value).trim()) {
    return null;
  }
  return normalizeHttpUrl(String(value));
}

function normalizeFieldLabelSnapshot(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 20) : null;
}

function normalizeJoinMark(value?: string | null): string | null {
  const trimmed = value?.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, 40) : null;
}

function mapRow(row: StampRow): Stamp {
  return {
    id: row.id,
    title: row.title,
    memo: row.memo,
    imagePath: row.image_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? null,
    galleryAssetId: row.gallery_asset_id ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    floor: sanitizeStampFloor(row.floor),
    placeLabel: normalizeOptionalText(row.place_label),
    extra1: normalizeOptionalText(row.extra1),
    extra2: normalizeOptionalText(row.extra2),
    extra3: normalizeOptionalText(row.extra3),
    sourceUrl: normalizeSourceUrl(row.source_url),
    templateId: normalizeTemplateId(row.template_id),
    titleFieldLabel: normalizeFieldLabelSnapshot(row.title_field_label),
    placeFieldLabel: normalizeFieldLabelSnapshot(row.place_field_label),
    memoFieldLabel: normalizeFieldLabelSnapshot(row.memo_field_label),
    extra1FieldLabel: normalizeFieldLabelSnapshot(row.extra1_field_label),
    extra2FieldLabel: normalizeFieldLabelSnapshot(row.extra2_field_label),
    extra3FieldLabel: normalizeFieldLabelSnapshot(row.extra3_field_label),
    parentId: normalizeParentId(row.parent_id),
    uploadedByMark: normalizeJoinMark(row.uploaded_by_mark),
  };
}

function labelParams(labels?: Partial<FieldLabels> | null) {
  const resolved = resolveFieldLabels(labels);
  return [
    resolved.titleFieldLabel,
    resolved.placeFieldLabel,
    resolved.memoFieldLabel,
    resolved.extra1FieldLabel,
    resolved.extra2FieldLabel,
    resolved.extra3FieldLabel,
  ] as const;
}

/** Root id for a follow-up chain (self when standalone). */
export function resolveFollowRootId(stamp: Pick<Stamp, 'id' | 'parentId'>): string {
  return normalizeParentId(stamp.parentId) ?? stamp.id;
}

export async function insertStamp(stamp: Stamp): Promise<void> {
  const db = await getDatabase();
  const labels = labelParams({
    titleFieldLabel: stamp.titleFieldLabel ?? undefined,
    placeFieldLabel: stamp.placeFieldLabel ?? undefined,
    memoFieldLabel: stamp.memoFieldLabel ?? undefined,
    extra1FieldLabel: stamp.extra1FieldLabel ?? undefined,
    extra2FieldLabel: stamp.extra2FieldLabel ?? undefined,
    extra3FieldLabel: stamp.extra3FieldLabel ?? undefined,
  });
  await db.runAsync(
    `INSERT INTO stamps (id, title, memo, image_path, created_at, updated_at, deleted_at, gallery_asset_id, latitude, longitude, floor, place_label, extra1, extra2, extra3, source_url, template_id, title_field_label, place_field_label, memo_field_label, extra1_field_label, extra2_field_label, extra3_field_label, parent_id, uploaded_by_mark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    stamp.id,
    stamp.title,
    stamp.memo,
    stamp.imagePath,
    stamp.createdAt,
    stamp.updatedAt,
    stamp.deletedAt ?? null,
    stamp.galleryAssetId ?? null,
    stamp.latitude ?? null,
    stamp.longitude ?? null,
    stamp.floor ?? null,
    normalizeOptionalText(stamp.placeLabel),
    normalizeOptionalText(stamp.extra1),
    normalizeOptionalText(stamp.extra2),
    normalizeOptionalText(stamp.extra3),
    normalizeSourceUrl(stamp.sourceUrl),
    normalizeTemplateId(stamp.templateId),
    labels[0],
    labels[1],
    labels[2],
    labels[3],
    labels[4],
    labels[5],
    normalizeParentId(stamp.parentId),
    normalizeJoinMark(stamp.uploadedByMark),
  );
}

export async function listStamps(): Promise<Stamp[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<StampRow>(
    `SELECT ${STAMP_COLUMNS} FROM stamps WHERE deleted_at IS NULL ORDER BY created_at DESC`,
  );
  return rows.map(mapRow);
}

export async function listTrashedStamps(): Promise<Stamp[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<StampRow>(
    `SELECT ${STAMP_COLUMNS} FROM stamps WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`,
  );
  return rows.map(mapRow);
}

export async function countTrashedStamps(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM stamps WHERE deleted_at IS NOT NULL',
  );
  return row?.c ?? 0;
}

export async function getStampById(id: string): Promise<Stamp | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<StampRow>(
    `SELECT ${STAMP_COLUMNS} FROM stamps WHERE id = ?`,
    id,
  );
  return row ? mapRow(row) : null;
}

/** Root + follow-ups for compare UI (oldest first). One query for children. */
export async function listFollowLinkChain(anchor: Stamp): Promise<Stamp[]> {
  const rootId = resolveFollowRootId(anchor);
  const db = await getDatabase();
  const rootRow = await db.getFirstAsync<StampRow>(
    `SELECT ${STAMP_COLUMNS} FROM stamps WHERE id = ? AND deleted_at IS NULL`,
    rootId,
  );
  if (!rootRow) {
    return [anchor];
  }
  const childRows = await db.getAllAsync<StampRow>(
    `SELECT ${STAMP_COLUMNS} FROM stamps WHERE parent_id = ? AND deleted_at IS NULL ORDER BY created_at ASC`,
    rootId,
  );
  return [mapRow(rootRow), ...childRows.map(mapRow)];
}

/** Live follow-up count for a root (trashed rows omitted). Uses parent_id index. */
export async function countFollowLinkChildren(rootId: string): Promise<number> {
  const id = normalizeParentId(rootId) ?? rootId.trim();
  if (!id) {
    return 0;
  }
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM stamps WHERE parent_id = ? AND deleted_at IS NULL',
    id,
  );
  const n = Number(row?.c);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function softDeleteStamps(ids: string[]): Promise<number> {
  if (ids.length === 0) {
    return 0;
  }

  const db = await getDatabase();
  const now = Date.now();
  let moved = 0;

  for (const id of ids) {
    const result = await db.runAsync(
      'UPDATE stamps SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
      now,
      now,
      id,
    );
    moved += result.changes;
  }

  return moved;
}

export async function restoreStamp(id: string): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'UPDATE stamps SET deleted_at = NULL, updated_at = ? WHERE id = ? AND deleted_at IS NOT NULL',
    Date.now(),
    id,
  );
  return result.changes > 0;
}

export async function deleteTrashedStampRows(): Promise<Stamp[]> {
  const trashed = await listTrashedStamps();
  if (trashed.length === 0) {
    return [];
  }

  const db = await getDatabase();
  await db.runAsync('DELETE FROM stamps WHERE deleted_at IS NOT NULL');
  return trashed;
}

export async function updateStampMetadata(
  id: string,
  title: string,
  memo: string,
  floor?: Stamp['floor'],
  placeLabel?: string | null,
  extra1?: string | null,
  extra2?: string | null,
  extra3?: string | null,
  fieldLabels?: Partial<FieldLabels> | null,
  sourceUrl?: string | null,
  templateId?: string | null,
): Promise<void> {
  const db = await getDatabase();
  const labels = labelParams(fieldLabels);
  await db.runAsync(
    `UPDATE stamps SET title = ?, memo = ?, floor = ?, place_label = ?, extra1 = ?, extra2 = ?, extra3 = ?, source_url = ?, template_id = ?,
      title_field_label = ?, place_field_label = ?, memo_field_label = ?, extra1_field_label = ?, extra2_field_label = ?, extra3_field_label = ?,
      updated_at = ? WHERE id = ?`,
    title,
    memo,
    floor ?? null,
    normalizeOptionalText(placeLabel),
    normalizeOptionalText(extra1),
    normalizeOptionalText(extra2),
    normalizeOptionalText(extra3),
    normalizeSourceUrl(sourceUrl),
    normalizeTemplateId(templateId),
    labels[0],
    labels[1],
    labels[2],
    labels[3],
    labels[4],
    labels[5],
    Date.now(),
    id,
  );
}

export async function updateStampMetadataAndImagePath(
  id: string,
  title: string,
  memo: string,
  imagePath: string,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE stamps SET title = ?, memo = ?, image_path = ?, updated_at = ? WHERE id = ?',
    title,
    memo,
    imagePath,
    Date.now(),
    id,
  );
}

export async function updateStampRecord(
  id: string,
  title: string,
  memo: string,
  imagePath: string,
  galleryAssetId?: string | null,
  floor?: Stamp['floor'],
  placeLabel?: string | null,
  extra1?: string | null,
  extra2?: string | null,
  extra3?: string | null,
  fieldLabels?: Partial<FieldLabels> | null,
  sourceUrl?: string | null,
  templateId?: string | null,
): Promise<void> {
  const db = await getDatabase();
  const labels = labelParams(fieldLabels);
  await db.runAsync(
    `UPDATE stamps
     SET title = ?, memo = ?, image_path = ?, gallery_asset_id = ?, floor = ?, place_label = ?, extra1 = ?, extra2 = ?, extra3 = ?, source_url = ?, template_id = ?,
         title_field_label = ?, place_field_label = ?, memo_field_label = ?, extra1_field_label = ?, extra2_field_label = ?, extra3_field_label = ?,
         updated_at = ?
     WHERE id = ?`,
    title,
    memo,
    imagePath,
    galleryAssetId ?? null,
    floor ?? null,
    normalizeOptionalText(placeLabel),
    normalizeOptionalText(extra1),
    normalizeOptionalText(extra2),
    normalizeOptionalText(extra3),
    normalizeSourceUrl(sourceUrl),
    normalizeTemplateId(templateId),
    labels[0],
    labels[1],
    labels[2],
    labels[3],
    labels[4],
    labels[5],
    Date.now(),
    id,
  );
}

export async function updateStampGalleryAssetId(id: string, galleryAssetId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE stamps SET gallery_asset_id = ?, updated_at = ? WHERE id = ?',
    galleryAssetId,
    Date.now(),
    id,
  );
}

export async function setStampUploadedByMarkIfEmpty(
  id: string,
  mark: string | null | undefined,
): Promise<boolean> {
  const safe = normalizeJoinMark(mark);
  if (!safe) return false;
  const db = await getDatabase();
  const result = await db.runAsync(
    `UPDATE stamps SET uploaded_by_mark = ?, updated_at = ?
     WHERE id = ? AND deleted_at IS NULL
       AND (uploaded_by_mark IS NULL OR TRIM(uploaded_by_mark) = '')`,
    safe,
    Date.now(),
    id,
  );
  return result.changes > 0;
}
