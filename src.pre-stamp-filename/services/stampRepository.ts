import { getDatabase } from '../db/database';
import type { Stamp, StampRow } from '../types/stamp';

function mapRow(row: StampRow): Stamp {
  return {
    id: row.id,
    title: row.title,
    memo: row.memo,
    imagePath: row.image_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function insertStamp(stamp: Stamp): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO stamps (id, title, memo, image_path, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    stamp.id,
    stamp.title,
    stamp.memo,
    stamp.imagePath,
    stamp.createdAt,
    stamp.updatedAt,
  );
}

export async function listStamps(): Promise<Stamp[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<StampRow>(
    'SELECT id, title, memo, image_path, created_at, updated_at FROM stamps ORDER BY created_at DESC',
  );
  return rows.map(mapRow);
}

export async function getStampById(id: string): Promise<Stamp | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<StampRow>(
    'SELECT id, title, memo, image_path, created_at, updated_at FROM stamps WHERE id = ?',
    id,
  );
  return row ? mapRow(row) : null;
}

export async function updateStampMetadata(id: string, title: string, memo: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE stamps SET title = ?, memo = ?, updated_at = ? WHERE id = ?',
    title,
    memo,
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
