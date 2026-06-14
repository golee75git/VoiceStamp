import { getDatabase } from '../db/database';
import { sanitizeStampFloor } from './stampFloor';
import type { StampFloor } from '../types/stamp';

const STAMPS_FOLDER_KEY = 'stamps_folder';
const PDF_PHOTOS_PER_PAGE_KEY = 'pdf_photos_per_page';
const PDF_IMAGE_QUALITY_KEY = 'pdf_image_quality';
const TITLE_TEXT_ALIGN_KEY = 'title_text_align';
const MEMO_TEXT_ALIGN_KEY = 'memo_text_align';
const PDF_SHOW_DATETIME_KEY = 'pdf_show_datetime';
const PDF_FILENAME_INCLUDE_DATETIME_KEY = 'pdf_filename_include_datetime';
const CAMERA_HAND_KEY = 'camera_hand';
const STAMP_TEXT_LAYOUT_KEY = 'stamp_text_layout';
const GALLERY_SAVE_MODE_KEY = 'gallery_save_mode';
const CURRENT_SITE_NAME_KEY = 'current_site_name';
const GALLERY_ALBUM_IDS_KEY = 'gallery_album_ids';
const ONBOARDING_SEEN_KEY = 'onboarding_seen';
const LAST_APP_OPEN_AT_KEY = 'last_app_open_at';
const START_SCREEN_HIDDEN_UNTIL_KEY = 'start_screen_hidden_until';
const FLOOR_PICKER_MODE_KEY = 'floor_picker_mode';
const LAST_FLOOR_KEY = 'last_floor';
const LAST_CAPTURE_LAT_KEY = 'last_capture_lat';
const LAST_CAPTURE_LON_KEY = 'last_capture_lon';
const LAST_PLACE_LABEL_KEY = 'last_place_label';

/** Reuse nearby previous place label when still within this distance (m). */
export const PLACE_CACHE_NEARBY_METERS = 300;

export const START_SCREEN_SNOOZE_DAYS = 7;

export const ONBOARDING_IDLE_RESHOW_DAYS = 30;

export const DEFAULT_STAMPS_FOLDER = 'stamps';
export const DEFAULT_PDF_PHOTOS_PER_PAGE = 1;
export const DEFAULT_PDF_IMAGE_QUALITY = 'original' as const;
export const DEFAULT_TITLE_TEXT_ALIGN = 'left' as const;
export const DEFAULT_MEMO_TEXT_ALIGN = 'left' as const;
export const DEFAULT_PDF_SHOW_DATETIME = true;
export const DEFAULT_PDF_FILENAME_INCLUDE_DATETIME = true;
export const DEFAULT_CAMERA_HAND = 'right' as const;
export const DEFAULT_STAMP_TEXT_LAYOUT = 'caption' as const;
export const DEFAULT_GALLERY_SAVE_MODE = 'original_only' as const;
export const DEFAULT_FLOOR_PICKER_MODE = 'school_only' as const;

export type PdfPhotosPerPage = 1 | 2 | 3 | 4;
export type PdfImageQuality = 'original' | 'standard' | 'compressed';
export type TextAlign = 'left' | 'center' | 'right';
export type CameraHand = 'left' | 'right';
export type StampTextLayout = 'caption' | 'watermark';
export type GallerySaveMode = 'original_only' | 'caption_only' | 'original_and_caption';
export type FloorPickerMode = 'off' | 'school_only' | 'always';

export function floorPickerModeLabel(mode: FloorPickerMode): string {
  switch (mode) {
    case 'off':
      return '사용 안 함';
    case 'always':
      return '항상 표시';
    default:
      return '학교일 때만';
  }
}

export function sanitizeFloorPickerMode(value: string): FloorPickerMode {
  if (value === 'off' || value === 'always') {
    return value;
  }
  return 'school_only';
}

export function stampTextLayoutLabel(layout: StampTextLayout): string {
  return layout === 'watermark' ? '워터마크' : '별도 영역';
}

export function sanitizeGallerySaveMode(value: string): GallerySaveMode {
  if (value === 'caption_only' || value === 'original_and_caption') {
    return value;
  }
  return 'original_only';
}

export function gallerySaveModeLabel(mode: GallerySaveMode): string {
  switch (mode) {
    case 'caption_only':
      return '캡션만';
    case 'original_and_caption':
      return '원본+캡션';
    default:
      return '원본만';
  }
}

export function sanitizeStampTextLayout(value: string): StampTextLayout {
  return value === 'watermark' ? 'watermark' : 'caption';
}

export const TEXT_ALIGN_OPTIONS: TextAlign[] = ['left', 'center', 'right'];

export function textAlignLabel(align: TextAlign): string {
  switch (align) {
    case 'center':
      return '가운데';
    case 'right':
      return '오른쪽';
    default:
      return '왼쪽';
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

export function sanitizeCameraHand(value: string): CameraHand {
  return value === 'left' ? 'left' : 'right';
}

export async function getCameraHand(): Promise<CameraHand> {
  const value = await readSetting(CAMERA_HAND_KEY);
  if (!value) {
    return DEFAULT_CAMERA_HAND;
  }
  return sanitizeCameraHand(value);
}

export async function setCameraHand(hand: CameraHand): Promise<CameraHand> {
  const safeHand = sanitizeCameraHand(hand);
  await writeSetting(CAMERA_HAND_KEY, safeHand);
  return safeHand;
}

export async function getStampTextLayout(): Promise<StampTextLayout> {
  const value = await readSetting(STAMP_TEXT_LAYOUT_KEY);
  if (!value) {
    return DEFAULT_STAMP_TEXT_LAYOUT;
  }
  return sanitizeStampTextLayout(value);
}

export async function setStampTextLayout(layout: StampTextLayout): Promise<StampTextLayout> {
  const safeLayout = sanitizeStampTextLayout(layout);
  await writeSetting(STAMP_TEXT_LAYOUT_KEY, safeLayout);
  return safeLayout;
}

export async function getGallerySaveMode(): Promise<GallerySaveMode> {
  const value = await readSetting(GALLERY_SAVE_MODE_KEY);
  if (!value) {
    return DEFAULT_GALLERY_SAVE_MODE;
  }
  return sanitizeGallerySaveMode(value);
}

export async function setGallerySaveMode(mode: GallerySaveMode): Promise<GallerySaveMode> {
  const safeMode = sanitizeGallerySaveMode(mode);
  await writeSetting(GALLERY_SAVE_MODE_KEY, safeMode);
  return safeMode;
}

export function sanitizeSiteName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '')
    .replace(/_+/g, '_')
    .replace(/^\.+/, '');
  return cleaned.length > 80 ? cleaned.slice(0, 80) : cleaned;
}

export async function getCurrentSiteName(): Promise<string> {
  const value = await readSetting(CURRENT_SITE_NAME_KEY);
  if (!value) {
    return '';
  }
  return sanitizeSiteName(value);
}

export async function setCurrentSiteName(name: string): Promise<string> {
  const safeName = sanitizeSiteName(name);
  await writeSetting(CURRENT_SITE_NAME_KEY, safeName);
  return safeName;
}

async function readGalleryAlbumIdMap(): Promise<Record<string, string>> {
  const raw = await readSetting(GALLERY_ALBUM_IDS_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function getGalleryAlbumId(albumName: string): Promise<string | null> {
  const map = await readGalleryAlbumIdMap();
  return map[albumName] ?? null;
}

export async function setGalleryAlbumId(albumName: string, albumId: string): Promise<void> {
  const map = await readGalleryAlbumIdMap();
  map[albumName] = albumId;
  await writeSetting(GALLERY_ALBUM_IDS_KEY, JSON.stringify(map));
}

export async function listKnownGalleryAlbumNames(): Promise<string[]> {
  const map = await readGalleryAlbumIdMap();
  return Object.keys(map).sort((a, b) => b.localeCompare(a));
}

export async function hasSeenOnboarding(): Promise<boolean> {
  return (await readSetting(ONBOARDING_SEEN_KEY)) === 'true';
}

export async function setOnboardingSeen(): Promise<void> {
  await writeSetting(ONBOARDING_SEEN_KEY, 'true');
}

export async function getLastAppOpenAt(): Promise<number | null> {
  const raw = await readSetting(LAST_APP_OPEN_AT_KEY);
  if (!raw) {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function setLastAppOpenAt(ms: number): Promise<void> {
  await writeSetting(LAST_APP_OPEN_AT_KEY, String(ms));
}

export async function shouldShowOnboarding(): Promise<boolean> {
  const seen = await hasSeenOnboarding();
  if (!seen) {
    return true;
  }

  const lastOpen = await getLastAppOpenAt();
  if (lastOpen === null) {
    return false;
  }

  const idleMs = ONBOARDING_IDLE_RESHOW_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - lastOpen >= idleMs;
}

export async function shouldShowStartScreen(): Promise<boolean> {
  const raw = await readSetting(START_SCREEN_HIDDEN_UNTIL_KEY);
  if (!raw) {
    return true;
  }
  const hiddenUntil = Number.parseInt(raw, 10);
  if (Number.isNaN(hiddenUntil)) {
    return true;
  }
  return Date.now() >= hiddenUntil;
}

export async function snoozeStartScreenForWeek(): Promise<void> {
  const hiddenUntil = Date.now() + START_SCREEN_SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  await writeSetting(START_SCREEN_HIDDEN_UNTIL_KEY, String(hiddenUntil));
}

export async function getFloorPickerMode(): Promise<FloorPickerMode> {
  const raw = await readSetting(FLOOR_PICKER_MODE_KEY);
  return raw ? sanitizeFloorPickerMode(raw) : DEFAULT_FLOOR_PICKER_MODE;
}

export async function setFloorPickerMode(mode: FloorPickerMode): Promise<FloorPickerMode> {
  const sanitized = sanitizeFloorPickerMode(mode);
  await writeSetting(FLOOR_PICKER_MODE_KEY, sanitized);
  return sanitized;
}

export async function getLastFloor(): Promise<StampFloor | null> {
  const raw = await readSetting(LAST_FLOOR_KEY);
  return sanitizeStampFloor(raw);
}

export async function setLastFloor(floor: StampFloor | null): Promise<void> {
  if (floor) {
    await writeSetting(LAST_FLOOR_KEY, floor);
  } else {
    await writeSetting(LAST_FLOOR_KEY, '');
  }
}

export type LastCapturePlaceCache = {
  latitude: number;
  longitude: number;
  placeLabel: string;
};

export async function getLastCapturePlaceCache(): Promise<LastCapturePlaceCache | null> {
  const [latRaw, lonRaw, placeLabel] = await Promise.all([
    readSetting(LAST_CAPTURE_LAT_KEY),
    readSetting(LAST_CAPTURE_LON_KEY),
    readSetting(LAST_PLACE_LABEL_KEY),
  ]);
  if (!latRaw || !lonRaw || !placeLabel?.trim()) {
    return null;
  }
  const latitude = Number.parseFloat(latRaw);
  const longitude = Number.parseFloat(lonRaw);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  return {
    latitude,
    longitude,
    placeLabel: placeLabel.trim(),
  };
}

export async function setLastCapturePlaceCache(cache: LastCapturePlaceCache): Promise<void> {
  await Promise.all([
    writeSetting(LAST_CAPTURE_LAT_KEY, String(cache.latitude)),
    writeSetting(LAST_CAPTURE_LON_KEY, String(cache.longitude)),
    writeSetting(LAST_PLACE_LABEL_KEY, cache.placeLabel.trim()),
  ]);
}
