import { getDatabase } from '../db/database';
import { sanitizeStampFloor } from './stampFloor';
import type { Stamp, StampRow } from '../types/stamp';

const STAMP_COLUMNS =
  'id, title, memo, image_path, created_at, updated_at, deleted_at, gallery_asset_id, latitude, longitude, floor';

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
  };
}

export async function insertStamp(stamp: Stamp): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO stamps (id, title, memo, image_path, created_at, updated_at, deleted_at, gallery_asset_id, latitude, longitude, floor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM stamps WHERE deleted_at IS NOT NULL',
  );
  return row?.count ?? 0;
}

export async function getStampById(id: string): Promise<Stamp | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<StampRow>(
    `SELECT ${STAMP_COLUMNS} FROM stamps WHERE id = ?`,
    id,
  );
  return row ? mapRow(row) : null;
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
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE stamps SET title = ?, memo = ?, floor = ?, updated_at = ? WHERE id = ?',
    title,
    memo,
    floor ?? null,
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
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE stamps
     SET title = ?, memo = ?, image_path = ?, gallery_asset_id = ?, floor = ?, updated_at = ?
     WHERE id = ?`,
    title,
    memo,
    imagePath,
    galleryAssetId ?? null,
    floor ?? null,
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
