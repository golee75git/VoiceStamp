import { getDatabase } from '../db/database';

const STAMPS_FOLDER_KEY = 'stamps_folder';
const PDF_PHOTOS_PER_PAGE_KEY = 'pdf_photos_per_page';
const PDF_IMAGE_QUALITY_KEY = 'pdf_image_quality';
const TITLE_TEXT_ALIGN_KEY = 'title_text_align';
const MEMO_TEXT_ALIGN_KEY = 'memo_text_align';
const PDF_SHOW_DATETIME_KEY = 'pdf_show_datetime';
const PDF_FILENAME_INCLUDE_DATETIME_KEY = 'pdf_filename_include_datetime';

export const DEFAULT_STAMPS_FOLDER = 'stamps';
export const DEFAULT_PDF_PHOTOS_PER_PAGE = 1;
export const DEFAULT_PDF_IMAGE_QUALITY = 'original' as const;
export const DEFAULT_TITLE_TEXT_ALIGN = 'left' as const;
export const DEFAULT_MEMO_TEXT_ALIGN = 'left' as const;
export const DEFAULT_PDF_SHOW_DATETIME = true;
export const DEFAULT_PDF_FILENAME_INCLUDE_DATETIME = true;

export type PdfPhotosPerPage = 1 | 2 | 3 | 4;
export type PdfImageQuality = 'original' | 'standard' | 'compressed';
export type TextAlign = 'left' | 'center' | 'right';

export const TEXT_ALIGN_OPTIONS: TextAlign[] = ['left', 'center', 'right'];

export function textAlignLabel(align: TextAlign): string {
  switch (align) {
    case 'center':
      return '媛?대뜲';
    case 'right':
      return '?ㅻⅨ履?;
    default:
      return '?쇱そ';
  }
}

export function sanitizeTextAlign(value: string): TextAlign {
  if (value === 'center' || value === 'right') {
    return value;
  }
  return 'left';
}

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

export function sanitizePdfImageQuality(value: string): PdfImageQuality {
  if (value === 'standard' || value === 'compressed') {
    return value;
  }
  return 'original';
}

export async function getPdfImageQuality(): Promise<PdfImageQuality> {
  const value = await readSetting(PDF_IMAGE_QUALITY_KEY);
  if (!value) {
    return DEFAULT_PDF_IMAGE_QUALITY;
  }
  return sanitizePdfImageQuality(value);
}

export async function setPdfImageQuality(quality: PdfImageQuality): Promise<PdfImageQuality> {
  const safeQuality = sanitizePdfImageQuality(quality);
  await writeSetting(PDF_IMAGE_QUALITY_KEY, safeQuality);
  return safeQuality;
}

export async function getTitleTextAlign(): Promise<TextAlign> {
  const value = await readSetting(TITLE_TEXT_ALIGN_KEY);
  if (!value) {
    return DEFAULT_TITLE_TEXT_ALIGN;
  }
  return sanitizeTextAlign(value);
}

export async function setTitleTextAlign(align: TextAlign): Promise<TextAlign> {
  const safeAlign = sanitizeTextAlign(align);
  await writeSetting(TITLE_TEXT_ALIGN_KEY, safeAlign);
  return safeAlign;
}

export async function getMemoTextAlign(): Promise<TextAlign> {
  const value = await readSetting(MEMO_TEXT_ALIGN_KEY);
  if (!value) {
    return DEFAULT_MEMO_TEXT_ALIGN;
  }
  return sanitizeTextAlign(value);
}

export async function setMemoTextAlign(align: TextAlign): Promise<TextAlign> {
  const safeAlign = sanitizeTextAlign(align);
  await writeSetting(MEMO_TEXT_ALIGN_KEY, safeAlign);
  return safeAlign;
}

function parseBooleanSetting(value: string | null, defaultValue: boolean): boolean {
  if (value === null) {
    return defaultValue;
  }
  return value === 'true';
}

export async function getPdfShowDatetime(): Promise<boolean> {
  const value = await readSetting(PDF_SHOW_DATETIME_KEY);
  return parseBooleanSetting(value, DEFAULT_PDF_SHOW_DATETIME);
}

export async function setPdfShowDatetime(show: boolean): Promise<boolean> {
  await writeSetting(PDF_SHOW_DATETIME_KEY, show ? 'true' : 'false');
  return show;
}

export async function getPdfFilenameIncludeDatetime(): Promise<boolean> {
  const value = await readSetting(PDF_FILENAME_INCLUDE_DATETIME_KEY);
  return parseBooleanSetting(value, DEFAULT_PDF_FILENAME_INCLUDE_DATETIME);
}

export async function setPdfFilenameIncludeDatetime(include: boolean): Promise<boolean> {
  await writeSetting(PDF_FILENAME_INCLUDE_DATETIME_KEY, include ? 'true' : 'false');
  return include;
}
