import { getDatabase } from '../db/database';
import {
  DEFAULT_FLOOR_DISPLAY_MODE,
  type FloorDisplayMode,
  floorDisplayModeLabel,
  sanitizeFloorDisplayMode,
  setFloorDisplayModeCache,
} from './floorDisplayMode';
import {
  DEFAULT_TITLE_DATETIME_MODE,
  type TitleDatetimeMode,
  sanitizeTitleDatetimeMode,
  setTitleDatetimeModeCache,
  titleDatetimeModeLabel,
} from './titleDatetimeMode';
import { sanitizeStampFloor } from './stampFloor';
import type { StampFloor } from '../types/stamp';
import {
  DEFAULT_OVERLAY_FOOTER_PHRASE,
  DEFAULT_OVERLAY_ORG_NAME,
  DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE,
  DEFAULT_OVERLAY_SHOW_ORG_NAME,
  OVERLAY_ORG_MAX_LENGTH,
  OVERLAY_PHRASE_MAX_LENGTH,
  sanitizeOverlayShowFlag,
  sanitizeOverlayText,
} from './overlayText';
import {
  DEFAULT_FIELD_EXTRA1_LABEL,
  DEFAULT_FIELD_EXTRA2_LABEL,
  DEFAULT_FIELD_MEMO_LABEL,
  DEFAULT_FIELD_PLACE_LABEL,
  DEFAULT_FIELD_TITLE_LABEL,
  FIELD_LABEL_MAX_LENGTH,
  sanitizeFieldLabel,
} from './fieldLabels';

const STAMPS_FOLDER_KEY = 'stamps_folder';
const PDF_PHOTOS_PER_PAGE_KEY = 'pdf_photos_per_page';
const PDF_IMAGE_QUALITY_KEY = 'pdf_image_quality';
const TITLE_TEXT_ALIGN_KEY = 'title_text_align';
const MEMO_TEXT_ALIGN_KEY = 'memo_text_align';
const PDF_SHOW_DATETIME_KEY = 'pdf_show_datetime';
const PDF_FILENAME_INCLUDE_DATETIME_KEY = 'pdf_filename_include_datetime';
const CAMERA_HAND_KEY = 'camera_hand';
const STAMP_TEXT_LAYOUT_KEY = 'stamp_text_layout';
const WATERMARK_STYLE_KEY = 'watermark_style';
const COORDS_LABEL_KEY = 'coords_label';
const LOCATION_MODE_KEY = 'location_mode';
const GALLERY_SAVE_MODE_KEY = 'gallery_save_mode';
const CONTINUOUS_CAPTURE_CAMERA_KEY = 'continuous_capture_camera';
const PRIMARY_CAPTURE_CAMERA_KEY = 'primary_capture_camera';
const CAPTURE_AFTER_MODE_KEY = 'capture_after_mode';
const SHUTTER_SOUND_KEY = 'shutter_sound';
const CURRENT_SITE_NAME_KEY = 'current_site_name';
const GALLERY_ALBUM_IDS_KEY = 'gallery_album_ids';
const ONBOARDING_SEEN_KEY = 'onboarding_seen';
const LAST_APP_OPEN_AT_KEY = 'last_app_open_at';
const START_SCREEN_HIDDEN_UNTIL_KEY = 'start_screen_hidden_until';
const FLOOR_PICKER_MODE_KEY = 'floor_picker_mode';
const FLOOR_DISPLAY_MODE_KEY = 'floor_display_mode';
const TITLE_DATETIME_MODE_KEY = 'title_datetime_mode';
const LAST_FLOOR_KEY = 'last_floor';
const LAST_CAPTURE_LAT_KEY = 'last_capture_lat';
const LAST_CAPTURE_LON_KEY = 'last_capture_lon';
const LAST_PLACE_LABEL_KEY = 'last_place_label';
const OVERLAY_ORG_NAME_KEY = 'overlay_org_name';
const OVERLAY_FOOTER_PHRASE_KEY = 'overlay_footer_phrase';
const OVERLAY_SHOW_ORG_NAME_KEY = 'overlay_show_org_name';
const OVERLAY_SHOW_FOOTER_PHRASE_KEY = 'overlay_show_footer_phrase';
const FIELD_LABEL_TITLE_KEY = 'field_label_title';
const FIELD_LABEL_PLACE_KEY = 'field_label_place';
const FIELD_LABEL_MEMO_KEY = 'field_label_memo';
const FIELD_LABEL_EXTRA1_KEY = 'field_label_extra1';
const FIELD_LABEL_EXTRA2_KEY = 'field_label_extra2';

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
export const DEFAULT_WATERMARK_STYLE = 'solid_dark' as const;
export const DEFAULT_COORDS_LABEL_MODE = 'off' as const;
export const DEFAULT_LOCATION_MODE = 'auto' as const;
export const DEFAULT_GALLERY_SAVE_MODE = 'original_only' as const;
export const DEFAULT_CONTINUOUS_CAPTURE_CAMERA = 'in_app' as const;
export const DEFAULT_PRIMARY_CAPTURE_CAMERA = 'system' as const;
export const DEFAULT_CAPTURE_AFTER_MODE = 'action_sheet' as const;
export const DEFAULT_SHUTTER_SOUND = true;
export {
  DEFAULT_OVERLAY_FOOTER_PHRASE,
  DEFAULT_OVERLAY_ORG_NAME,
  DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE,
  DEFAULT_OVERLAY_SHOW_ORG_NAME,
  OVERLAY_ORG_MAX_LENGTH,
  OVERLAY_PHRASE_MAX_LENGTH,
} from './overlayText';
export {
  DEFAULT_FIELD_EXTRA1_LABEL,
  DEFAULT_FIELD_EXTRA2_LABEL,
  DEFAULT_FIELD_MEMO_LABEL,
  DEFAULT_FIELD_PLACE_LABEL,
  DEFAULT_FIELD_TITLE_LABEL,
  FIELD_LABEL_MAX_LENGTH,
} from './fieldLabels';
export type { FieldLabels } from './fieldLabels';
export const DEFAULT_FLOOR_PICKER_MODE = 'school_only' as const;
export { DEFAULT_FLOOR_DISPLAY_MODE, floorDisplayModeLabel, type FloorDisplayMode } from './floorDisplayMode';
export {
  DEFAULT_TITLE_DATETIME_MODE,
  titleDatetimeModeLabel,
  type TitleDatetimeMode,
} from './titleDatetimeMode';

export type PdfPhotosPerPage = 1 | 2 | 3 | 4;
export type PdfImageQuality = 'original' | 'standard' | 'compressed';
export type TextAlign = 'left' | 'center' | 'right';
export type CameraHand = 'left' | 'right';
export type StampTextLayout = 'caption' | 'watermark';
export type WatermarkStyle =
  | 'solid_dark'
  | 'solid_light'
  | 'slate'
  | 'blue'
  | 'indigo'
  | 'green'
  | 'teal'
  | 'amber'
  | 'red'
  | 'rose';
export type CoordsLabelMode = 'gps' | 'coords' | 'off';
export type LocationMode = 'auto' | 'off';
export type GallerySaveMode = 'app_only' | 'original_only' | 'caption_only' | 'original_and_caption';
export type ContinuousCaptureCamera = 'system' | 'in_app';
export type CaptureAfterMode = 'action_sheet' | 'save_modal';
export type FloorPickerMode = 'off' | 'school_only' | 'always';

export function locationModeLabel(mode: LocationMode): string {
  return mode === 'off' ? '사용 안 함' : '사용';
}

export function sanitizeLocationMode(value: string): LocationMode {
  return value === 'off' ? 'off' : 'auto';
}

/** GPS·로컬 학교 DB 장소 조회. 「사용」「사용 안 함」모두 허용. */
export async function isGpsPlaceEnabled(): Promise<boolean> {
  return true;
}

/** 카카오 네트워크 주소·POI 조회. 「사용」만. */
export async function isKakaoPlaceEnabled(): Promise<boolean> {
  return (await getLocationMode()) === 'auto';
}

/** 카카오 포함 전체 위치 조회(「사용」). GPS·학교는 isGpsPlaceEnabled. */
export async function isLocationLookupEnabled(): Promise<boolean> {
  return isKakaoPlaceEnabled();
}

export function captureCameraLabel(mode: ContinuousCaptureCamera): string {
  return mode === 'in_app' ? '앱 내 (빠름)' : '시스템';
}

export function continuousCaptureCameraLabel(mode: ContinuousCaptureCamera): string {
  return captureCameraLabel(mode);
}

export function primaryCaptureCameraLabel(mode: ContinuousCaptureCamera): string {
  return captureCameraLabel(mode);
}

export function captureAfterModeLabel(mode: CaptureAfterMode): string {
  return mode === 'save_modal' ? '저장 화면 바로' : '선택 화면';
}

export function sanitizeCaptureAfterMode(value: string): CaptureAfterMode {
  return value === 'save_modal' ? 'save_modal' : 'action_sheet';
}

export function sanitizeContinuousCaptureCamera(value: string): ContinuousCaptureCamera {
  if (value === 'system') {
    return 'system';
  }
  return 'in_app';
}

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

export const WATERMARK_STYLE_OPTIONS: WatermarkStyle[] = [
  'solid_dark',
  'solid_light',
  'slate',
  'blue',
  'indigo',
  'green',
  'teal',
  'amber',
  'red',
  'rose',
];

export function watermarkStyleLabel(style: WatermarkStyle): string {
  switch (style) {
    case 'solid_light':
      return '흰색';
    case 'slate':
      return '슬레이트';
    case 'blue':
      return '파랑';
    case 'indigo':
      return '남보라';
    case 'green':
      return '초록';
    case 'teal':
      return '청록';
    case 'amber':
      return '호박';
    case 'red':
      return '빨강';
    case 'rose':
      return '로즈';
    default:
      return '검정';
  }
}

export function sanitizeWatermarkStyle(value: string): WatermarkStyle {
  if ((WATERMARK_STYLE_OPTIONS as string[]).includes(value)) {
    return value as WatermarkStyle;
  }
  return DEFAULT_WATERMARK_STYLE;
}

export function coordsLabelModeLabel(mode: CoordsLabelMode): string {
  switch (mode) {
    case 'gps':
      return 'GPS';
    case 'coords':
      return '좌표';
    default:
      return '없음';
  }
}

export function sanitizeCoordsLabelMode(value: string): CoordsLabelMode {
  if (value === 'gps' || value === 'coords') {
    return value;
  }
  return 'off';
}

export function sanitizeGallerySaveMode(value: string): GallerySaveMode {
  if (value === 'app_only') {
    return 'app_only';
  }
  if (value === 'caption_only' || value === 'original_and_caption') {
    return value;
  }
  return 'original_only';
}

export function gallerySaveModeLabel(mode: GallerySaveMode): string {
  switch (mode) {
    case 'app_only':
      return '앱만';
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

async function readAllSettingsMap(): Promise<Map<string, string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM app_settings',
  );
  return new Map(rows.map((row) => [row.key, row.value]));
}

function pickSetting(map: Map<string, string>, key: string): string | null {
  return map.get(key) ?? null;
}

export type SettingsScreenSnapshot = {
  folderName: string;
  pdfPhotosPerPage: PdfPhotosPerPage;
  pdfImageQuality: PdfImageQuality;
  titleTextAlign: TextAlign;
  memoTextAlign: TextAlign;
  pdfShowDatetime: boolean;
  pdfFilenameIncludeDatetime: boolean;
  stampTextLayout: StampTextLayout;
  watermarkStyle: WatermarkStyle;
  gallerySaveMode: GallerySaveMode;
  primaryCaptureCamera: ContinuousCaptureCamera;
  continuousCaptureCamera: ContinuousCaptureCamera;
  captureAfterMode: CaptureAfterMode;
  shutterSound: boolean;
  cameraHand: CameraHand;
  floorPickerMode: FloorPickerMode;
  floorDisplayMode: FloorDisplayMode;
  titleDatetimeMode: TitleDatetimeMode;
  coordsLabelMode: CoordsLabelMode;
  locationMode: LocationMode;
  overlayOrgName: string;
  overlayFooterPhrase: string;
  overlayShowOrgName: boolean;
  overlayShowFooterPhrase: boolean;
  titleFieldLabel: string;
  placeFieldLabel: string;
  memoFieldLabel: string;
  extra1FieldLabel: string;
  extra2FieldLabel: string;
};

export async function loadSettingsForScreen(): Promise<SettingsScreenSnapshot> {
  const map = await readAllSettingsMap();

  const folderRaw = pickSetting(map, STAMPS_FOLDER_KEY);
  const perPageRaw = pickSetting(map, PDF_PHOTOS_PER_PAGE_KEY);
  const perPageParsed = perPageRaw ? Number.parseInt(perPageRaw, 10) : Number.NaN;

  const floorDisplayMode = (() => {
    const raw = pickSetting(map, FLOOR_DISPLAY_MODE_KEY);
    return raw ? sanitizeFloorDisplayMode(raw) : DEFAULT_FLOOR_DISPLAY_MODE;
  })();
  setFloorDisplayModeCache(floorDisplayMode);

  const titleDatetimeMode = (() => {
    const raw = pickSetting(map, TITLE_DATETIME_MODE_KEY);
    return raw ? sanitizeTitleDatetimeMode(raw) : DEFAULT_TITLE_DATETIME_MODE;
  })();
  setTitleDatetimeModeCache(titleDatetimeMode);

  return {
    folderName: folderRaw ? sanitizeStampsFolderName(folderRaw) : DEFAULT_STAMPS_FOLDER,
    pdfPhotosPerPage:
      perPageRaw && !Number.isNaN(perPageParsed)
        ? sanitizePdfPhotosPerPage(perPageParsed)
        : DEFAULT_PDF_PHOTOS_PER_PAGE,
    pdfImageQuality: (() => {
      const raw = pickSetting(map, PDF_IMAGE_QUALITY_KEY);
      return raw ? sanitizePdfImageQuality(raw) : DEFAULT_PDF_IMAGE_QUALITY;
    })(),
    titleTextAlign: (() => {
      const raw = pickSetting(map, TITLE_TEXT_ALIGN_KEY);
      return raw ? sanitizeTextAlign(raw) : DEFAULT_TITLE_TEXT_ALIGN;
    })(),
    memoTextAlign: (() => {
      const raw = pickSetting(map, MEMO_TEXT_ALIGN_KEY);
      return raw ? sanitizeTextAlign(raw) : DEFAULT_MEMO_TEXT_ALIGN;
    })(),
    pdfShowDatetime: parseBooleanSetting(
      pickSetting(map, PDF_SHOW_DATETIME_KEY),
      DEFAULT_PDF_SHOW_DATETIME,
    ),
    pdfFilenameIncludeDatetime: parseBooleanSetting(
      pickSetting(map, PDF_FILENAME_INCLUDE_DATETIME_KEY),
      DEFAULT_PDF_FILENAME_INCLUDE_DATETIME,
    ),
    stampTextLayout: (() => {
      const raw = pickSetting(map, STAMP_TEXT_LAYOUT_KEY);
      return raw ? sanitizeStampTextLayout(raw) : DEFAULT_STAMP_TEXT_LAYOUT;
    })(),
    watermarkStyle: (() => {
      const raw = pickSetting(map, WATERMARK_STYLE_KEY);
      return raw ? sanitizeWatermarkStyle(raw) : DEFAULT_WATERMARK_STYLE;
    })(),
    gallerySaveMode: (() => {
      const raw = pickSetting(map, GALLERY_SAVE_MODE_KEY);
      return raw ? sanitizeGallerySaveMode(raw) : DEFAULT_GALLERY_SAVE_MODE;
    })(),
    primaryCaptureCamera: (() => {
      const raw = pickSetting(map, PRIMARY_CAPTURE_CAMERA_KEY);
      return raw ? sanitizeContinuousCaptureCamera(raw) : DEFAULT_PRIMARY_CAPTURE_CAMERA;
    })(),
    continuousCaptureCamera: (() => {
      const raw = pickSetting(map, CONTINUOUS_CAPTURE_CAMERA_KEY);
      return raw ? sanitizeContinuousCaptureCamera(raw) : DEFAULT_CONTINUOUS_CAPTURE_CAMERA;
    })(),
    captureAfterMode: (() => {
      const raw = pickSetting(map, CAPTURE_AFTER_MODE_KEY);
      return raw ? sanitizeCaptureAfterMode(raw) : DEFAULT_CAPTURE_AFTER_MODE;
    })(),
    shutterSound: parseBooleanSetting(
      pickSetting(map, SHUTTER_SOUND_KEY),
      DEFAULT_SHUTTER_SOUND,
    ),
    cameraHand: (() => {
      const raw = pickSetting(map, CAMERA_HAND_KEY);
      return raw ? sanitizeCameraHand(raw) : DEFAULT_CAMERA_HAND;
    })(),
    floorPickerMode: (() => {
      const raw = pickSetting(map, FLOOR_PICKER_MODE_KEY);
      return raw ? sanitizeFloorPickerMode(raw) : DEFAULT_FLOOR_PICKER_MODE;
    })(),
    floorDisplayMode,
    titleDatetimeMode,
    coordsLabelMode: (() => {
      const raw = pickSetting(map, COORDS_LABEL_KEY);
      return raw ? sanitizeCoordsLabelMode(raw) : DEFAULT_COORDS_LABEL_MODE;
    })(),
    locationMode: (() => {
      const raw = pickSetting(map, LOCATION_MODE_KEY);
      return raw ? sanitizeLocationMode(raw) : DEFAULT_LOCATION_MODE;
    })(),
    overlayOrgName: (() => {
      const raw = pickSetting(map, OVERLAY_ORG_NAME_KEY);
      return raw ? sanitizeOverlayText(raw, OVERLAY_ORG_MAX_LENGTH) : DEFAULT_OVERLAY_ORG_NAME;
    })(),
    overlayFooterPhrase: (() => {
      const raw = pickSetting(map, OVERLAY_FOOTER_PHRASE_KEY);
      return raw
        ? sanitizeOverlayText(raw, OVERLAY_PHRASE_MAX_LENGTH)
        : DEFAULT_OVERLAY_FOOTER_PHRASE;
    })(),
    overlayShowOrgName: (() => {
      const raw = pickSetting(map, OVERLAY_SHOW_ORG_NAME_KEY);
      return raw ? sanitizeOverlayShowFlag(raw) : DEFAULT_OVERLAY_SHOW_ORG_NAME;
    })(),
    overlayShowFooterPhrase: (() => {
      const raw = pickSetting(map, OVERLAY_SHOW_FOOTER_PHRASE_KEY);
      return raw ? sanitizeOverlayShowFlag(raw) : DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE;
    })(),
    titleFieldLabel: (() => {
      const raw = pickSetting(map, FIELD_LABEL_TITLE_KEY);
      return raw
        ? sanitizeFieldLabel(raw, DEFAULT_FIELD_TITLE_LABEL)
        : DEFAULT_FIELD_TITLE_LABEL;
    })(),
    placeFieldLabel: (() => {
      const raw = pickSetting(map, FIELD_LABEL_PLACE_KEY);
      return raw
        ? sanitizeFieldLabel(raw, DEFAULT_FIELD_PLACE_LABEL)
        : DEFAULT_FIELD_PLACE_LABEL;
    })(),
    memoFieldLabel: (() => {
      const raw = pickSetting(map, FIELD_LABEL_MEMO_KEY);
      return raw
        ? sanitizeFieldLabel(raw, DEFAULT_FIELD_MEMO_LABEL)
        : DEFAULT_FIELD_MEMO_LABEL;
    })(),
    extra1FieldLabel: (() => {
      const raw = pickSetting(map, FIELD_LABEL_EXTRA1_KEY);
      return raw
        ? sanitizeFieldLabel(raw, DEFAULT_FIELD_EXTRA1_LABEL)
        : DEFAULT_FIELD_EXTRA1_LABEL;
    })(),
    extra2FieldLabel: (() => {
      const raw = pickSetting(map, FIELD_LABEL_EXTRA2_KEY);
      return raw
        ? sanitizeFieldLabel(raw, DEFAULT_FIELD_EXTRA2_LABEL)
        : DEFAULT_FIELD_EXTRA2_LABEL;
    })(),
  };
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

export async function getWatermarkStyle(): Promise<WatermarkStyle> {
  const value = await readSetting(WATERMARK_STYLE_KEY);
  if (!value) {
    return DEFAULT_WATERMARK_STYLE;
  }
  return sanitizeWatermarkStyle(value);
}

export async function setWatermarkStyle(style: WatermarkStyle): Promise<WatermarkStyle> {
  const safeStyle = sanitizeWatermarkStyle(style);
  await writeSetting(WATERMARK_STYLE_KEY, safeStyle);
  return safeStyle;
}

export async function getCoordsLabelMode(): Promise<CoordsLabelMode> {
  const value = await readSetting(COORDS_LABEL_KEY);
  if (!value) {
    return DEFAULT_COORDS_LABEL_MODE;
  }
  return sanitizeCoordsLabelMode(value);
}

export async function setCoordsLabelMode(mode: CoordsLabelMode): Promise<CoordsLabelMode> {
  const safeMode = sanitizeCoordsLabelMode(mode);
  await writeSetting(COORDS_LABEL_KEY, safeMode);
  return safeMode;
}

export async function getLocationMode(): Promise<LocationMode> {
  const value = await readSetting(LOCATION_MODE_KEY);
  if (!value) {
    return DEFAULT_LOCATION_MODE;
  }
  return sanitizeLocationMode(value);
}

export async function setLocationMode(mode: LocationMode): Promise<LocationMode> {
  const safeMode = sanitizeLocationMode(mode);
  await writeSetting(LOCATION_MODE_KEY, safeMode);
  return safeMode;
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

export async function getContinuousCaptureCamera(): Promise<ContinuousCaptureCamera> {
  const value = await readSetting(CONTINUOUS_CAPTURE_CAMERA_KEY);
  if (!value) {
    return DEFAULT_CONTINUOUS_CAPTURE_CAMERA;
  }
  return sanitizeContinuousCaptureCamera(value);
}

export async function setContinuousCaptureCamera(
  mode: ContinuousCaptureCamera,
): Promise<ContinuousCaptureCamera> {
  const safeMode = sanitizeContinuousCaptureCamera(mode);
  await writeSetting(CONTINUOUS_CAPTURE_CAMERA_KEY, safeMode);
  return safeMode;
}

export async function getPrimaryCaptureCamera(): Promise<ContinuousCaptureCamera> {
  const value = await readSetting(PRIMARY_CAPTURE_CAMERA_KEY);
  if (!value) {
    return DEFAULT_PRIMARY_CAPTURE_CAMERA;
  }
  return sanitizeContinuousCaptureCamera(value);
}

export async function setPrimaryCaptureCamera(
  mode: ContinuousCaptureCamera,
): Promise<ContinuousCaptureCamera> {
  const safeMode = sanitizeContinuousCaptureCamera(mode);
  await writeSetting(PRIMARY_CAPTURE_CAMERA_KEY, safeMode);
  return safeMode;
}

export async function getCaptureAfterMode(): Promise<CaptureAfterMode> {
  const value = await readSetting(CAPTURE_AFTER_MODE_KEY);
  if (!value) {
    return DEFAULT_CAPTURE_AFTER_MODE;
  }
  return sanitizeCaptureAfterMode(value);
}

export async function setCaptureAfterMode(mode: CaptureAfterMode): Promise<CaptureAfterMode> {
  const safeMode = sanitizeCaptureAfterMode(mode);
  await writeSetting(CAPTURE_AFTER_MODE_KEY, safeMode);
  return safeMode;
}

export function shutterSoundLabel(enabled: boolean): string {
  return enabled ? '켜기' : '끄기';
}

export async function getShutterSoundEnabled(): Promise<boolean> {
  const value = await readSetting(SHUTTER_SOUND_KEY);
  return parseBooleanSetting(value, DEFAULT_SHUTTER_SOUND);
}

export async function setShutterSoundEnabled(enabled: boolean): Promise<boolean> {
  await writeSetting(SHUTTER_SOUND_KEY, enabled ? 'true' : 'false');
  return enabled;
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

export async function getOverlayOrgName(): Promise<string> {
  const value = await readSetting(OVERLAY_ORG_NAME_KEY);
  if (!value) {
    return DEFAULT_OVERLAY_ORG_NAME;
  }
  return sanitizeOverlayText(value, OVERLAY_ORG_MAX_LENGTH);
}

export async function setOverlayOrgName(name: string): Promise<string> {
  const safeName = sanitizeOverlayText(name, OVERLAY_ORG_MAX_LENGTH);
  await writeSetting(OVERLAY_ORG_NAME_KEY, safeName);
  return safeName;
}

export async function getOverlayFooterPhrase(): Promise<string> {
  const value = await readSetting(OVERLAY_FOOTER_PHRASE_KEY);
  if (!value) {
    return DEFAULT_OVERLAY_FOOTER_PHRASE;
  }
  return sanitizeOverlayText(value, OVERLAY_PHRASE_MAX_LENGTH);
}

export async function setOverlayFooterPhrase(phrase: string): Promise<string> {
  const safePhrase = sanitizeOverlayText(phrase, OVERLAY_PHRASE_MAX_LENGTH);
  await writeSetting(OVERLAY_FOOTER_PHRASE_KEY, safePhrase);
  return safePhrase;
}

export async function getOverlayShowOrgName(): Promise<boolean> {
  const value = await readSetting(OVERLAY_SHOW_ORG_NAME_KEY);
  if (!value) {
    return DEFAULT_OVERLAY_SHOW_ORG_NAME;
  }
  return sanitizeOverlayShowFlag(value);
}

export async function setOverlayShowOrgName(show: boolean): Promise<boolean> {
  const safeShow = sanitizeOverlayShowFlag(show);
  await writeSetting(OVERLAY_SHOW_ORG_NAME_KEY, safeShow ? 'true' : 'false');
  return safeShow;
}

export async function getOverlayShowFooterPhrase(): Promise<boolean> {
  const value = await readSetting(OVERLAY_SHOW_FOOTER_PHRASE_KEY);
  if (!value) {
    return DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE;
  }
  return sanitizeOverlayShowFlag(value);
}

export async function setOverlayShowFooterPhrase(show: boolean): Promise<boolean> {
  const safeShow = sanitizeOverlayShowFlag(show);
  await writeSetting(OVERLAY_SHOW_FOOTER_PHRASE_KEY, safeShow ? 'true' : 'false');
  return safeShow;
}

export async function getTitleFieldLabel(): Promise<string> {
  const value = await readSetting(FIELD_LABEL_TITLE_KEY);
  if (!value) {
    return DEFAULT_FIELD_TITLE_LABEL;
  }
  return sanitizeFieldLabel(value, DEFAULT_FIELD_TITLE_LABEL);
}

export async function setTitleFieldLabel(label: string): Promise<string> {
  const safe = sanitizeFieldLabel(label, DEFAULT_FIELD_TITLE_LABEL);
  await writeSetting(FIELD_LABEL_TITLE_KEY, safe);
  return safe;
}

export async function getPlaceFieldLabel(): Promise<string> {
  const value = await readSetting(FIELD_LABEL_PLACE_KEY);
  if (!value) {
    return DEFAULT_FIELD_PLACE_LABEL;
  }
  return sanitizeFieldLabel(value, DEFAULT_FIELD_PLACE_LABEL);
}

export async function setPlaceFieldLabel(label: string): Promise<string> {
  const safe = sanitizeFieldLabel(label, DEFAULT_FIELD_PLACE_LABEL);
  await writeSetting(FIELD_LABEL_PLACE_KEY, safe);
  return safe;
}

export async function getMemoFieldLabel(): Promise<string> {
  const value = await readSetting(FIELD_LABEL_MEMO_KEY);
  if (!value) {
    return DEFAULT_FIELD_MEMO_LABEL;
  }
  return sanitizeFieldLabel(value, DEFAULT_FIELD_MEMO_LABEL);
}

export async function setMemoFieldLabel(label: string): Promise<string> {
  const safe = sanitizeFieldLabel(label, DEFAULT_FIELD_MEMO_LABEL);
  await writeSetting(FIELD_LABEL_MEMO_KEY, safe);
  return safe;
}

export async function getExtra1FieldLabel(): Promise<string> {
  const value = await readSetting(FIELD_LABEL_EXTRA1_KEY);
  if (!value) {
    return DEFAULT_FIELD_EXTRA1_LABEL;
  }
  return sanitizeFieldLabel(value, DEFAULT_FIELD_EXTRA1_LABEL);
}

export async function setExtra1FieldLabel(label: string): Promise<string> {
  const safe = sanitizeFieldLabel(label, DEFAULT_FIELD_EXTRA1_LABEL);
  await writeSetting(FIELD_LABEL_EXTRA1_KEY, safe);
  return safe;
}

export async function getExtra2FieldLabel(): Promise<string> {
  const value = await readSetting(FIELD_LABEL_EXTRA2_KEY);
  if (!value) {
    return DEFAULT_FIELD_EXTRA2_LABEL;
  }
  return sanitizeFieldLabel(value, DEFAULT_FIELD_EXTRA2_LABEL);
}

export async function setExtra2FieldLabel(label: string): Promise<string> {
  const safe = sanitizeFieldLabel(label, DEFAULT_FIELD_EXTRA2_LABEL);
  await writeSetting(FIELD_LABEL_EXTRA2_KEY, safe);
  return safe;
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

export async function getFloorDisplayMode(): Promise<FloorDisplayMode> {
  const raw = await readSetting(FLOOR_DISPLAY_MODE_KEY);
  const mode = raw ? sanitizeFloorDisplayMode(raw) : DEFAULT_FLOOR_DISPLAY_MODE;
  setFloorDisplayModeCache(mode);
  return mode;
}

export async function setFloorDisplayMode(mode: FloorDisplayMode): Promise<FloorDisplayMode> {
  const sanitized = sanitizeFloorDisplayMode(mode);
  await writeSetting(FLOOR_DISPLAY_MODE_KEY, sanitized);
  setFloorDisplayModeCache(sanitized);
  return sanitized;
}

export async function getTitleDatetimeMode(): Promise<TitleDatetimeMode> {
  const raw = await readSetting(TITLE_DATETIME_MODE_KEY);
  const mode = raw ? sanitizeTitleDatetimeMode(raw) : DEFAULT_TITLE_DATETIME_MODE;
  setTitleDatetimeModeCache(mode);
  return mode;
}

export async function setTitleDatetimeMode(mode: TitleDatetimeMode): Promise<TitleDatetimeMode> {
  const sanitized = sanitizeTitleDatetimeMode(mode);
  await writeSetting(TITLE_DATETIME_MODE_KEY, sanitized);
  setTitleDatetimeModeCache(sanitized);
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

export async function getLastPlaceLabel(): Promise<string | null> {
  const raw = await readSetting(LAST_PLACE_LABEL_KEY);
  const trimmed = raw?.trim();
  return trimmed || null;
}

export async function setLastPlaceLabel(placeLabel: string): Promise<void> {
  const trimmed = placeLabel.trim();
  if (!trimmed) {
    return;
  }
  await writeSetting(LAST_PLACE_LABEL_KEY, trimmed);
}

export async function setLastCapturePlaceCache(cache: LastCapturePlaceCache): Promise<void> {
  await Promise.all([
    writeSetting(LAST_CAPTURE_LAT_KEY, String(cache.latitude)),
    writeSetting(LAST_CAPTURE_LON_KEY, String(cache.longitude)),
    setLastPlaceLabel(cache.placeLabel),
  ]);
}
