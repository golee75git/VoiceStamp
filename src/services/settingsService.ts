import { getDatabase } from '../db/database';

const STAMPS_FOLDER_KEY = 'stamps_folder';
export const DEFAULT_STAMPS_FOLDER = 'stamps';

export function sanitizeStampsFolderName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^\.+/, '');
  return cleaned || DEFAULT_STAMPS_FOLDER;
}

export async function getStampsFolderName(): Promise<string> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    STAMPS_FOLDER_KEY,
  );
  if (!row?.value) {
    return DEFAULT_STAMPS_FOLDER;
  }
  return sanitizeStampsFolderName(row.value);
}

export async function setStampsFolderName(name: string): Promise<string> {
  const safeName = sanitizeStampsFolderName(name);
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    STAMPS_FOLDER_KEY,
    safeName,
  );
  return safeName;
}
