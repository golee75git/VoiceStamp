import { getDatabase } from '../db/database';

const STAMPS_FOLDER_KEY = 'stamps_folder';
const PDF_PHOTOS_PER_PAGE_KEY = 'pdf_photos_per_page';

export const DEFAULT_STAMPS_FOLDER = 'stamps';
export const DEFAULT_PDF_PHOTOS_PER_PAGE = 1;

export type PdfPhotosPerPage = 1 | 2 | 3 | 4;

export function sanitizeStampsFolderName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^\.+/, '');
  return cleaned || DEFAULT_STAMPS_FOLDER;
}

export function sanitizePdfPhotosPerPage(value: number): PdfPhotosPerPage {
  if (value <= 1) {
    return 1;
  }
  if (value === 2) {
    return 2;
  }
  if (value === 3) {
    return 3;
  }
  return 4;
}

async function readSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

async function writeSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value,
  );
}

export async function getStampsFolderName(): Promise<string> {
  const value = await readSetting(STAMPS_FOLDER_KEY);
  if (!value) {
    return DEFAULT_STAMPS_FOLDER;
  }
  return sanitizeStampsFolderName(value);
}

export async function setStampsFolderName(name: string): Promise<string> {
  const safeName = sanitizeStampsFolderName(name);
  await writeSetting(STAMPS_FOLDER_KEY, safeName);
  return safeName;
}

export async function getPdfPhotosPerPage(): Promise<PdfPhotosPerPage> {
  const value = await readSetting(PDF_PHOTOS_PER_PAGE_KEY);
  if (!value) {
    return DEFAULT_PDF_PHOTOS_PER_PAGE;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_PDF_PHOTOS_PER_PAGE;
  }
  return sanitizePdfPhotosPerPage(parsed);
}

export async function setPdfPhotosPerPage(count: number): Promise<PdfPhotosPerPage> {
  const safeCount = sanitizePdfPhotosPerPage(count);
  await writeSetting(PDF_PHOTOS_PER_PAGE_KEY, String(safeCount));
  return safeCount;
}
