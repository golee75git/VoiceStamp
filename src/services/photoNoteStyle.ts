/** Presets for photo note pad (글 칸) appearance: text size, text color, background color/opacity. */

export type PhotoNoteTextSize = 'small' | 'medium' | 'large';
export type PhotoNoteColorKey = 'dark' | 'white' | 'yellow' | 'sky' | 'rose' | 'mint';

export const PHOTO_NOTE_TEXT_SIZE_OPTIONS: PhotoNoteTextSize[] = ['small', 'medium', 'large'];
export const PHOTO_NOTE_COLOR_OPTIONS: PhotoNoteColorKey[] = [
  'dark',
  'white',
  'yellow',
  'sky',
  'rose',
  'mint',
];
export const PHOTO_NOTE_OPACITY_OPTIONS: number[] = [0, 25, 50, 75, 100];

export const DEFAULT_PHOTO_NOTE_TEXT_SIZE: PhotoNoteTextSize = 'medium';
export const DEFAULT_PHOTO_NOTE_TEXT_COLOR: PhotoNoteColorKey = 'dark';
export const DEFAULT_PHOTO_NOTE_BG_COLOR: PhotoNoteColorKey = 'white';
export const DEFAULT_PHOTO_NOTE_BG_OPACITY = 100;

const COLOR_HEX: Record<PhotoNoteColorKey, string> = {
  dark: '#111827',
  white: '#F8FAFC',
  yellow: '#FDE68A',
  sky: '#93C5FD',
  rose: '#FBCFE8',
  mint: '#99F6E4',
};

export function photoNoteColorHex(key: PhotoNoteColorKey): string {
  return COLOR_HEX[key] ?? COLOR_HEX[DEFAULT_PHOTO_NOTE_TEXT_COLOR];
}

export function photoNoteTextSizeLabel(size: PhotoNoteTextSize): string {
  switch (size) {
    case 'small':
      return '작게';
    case 'large':
      return '크게';
    default:
      return '보통';
  }
}

export function photoNoteColorLabel(key: PhotoNoteColorKey): string {
  switch (key) {
    case 'dark':
      return '검정';
    case 'white':
      return '흰색';
    case 'yellow':
      return '노랑';
    case 'sky':
      return '하늘';
    case 'rose':
      return '분홍';
    case 'mint':
      return '민트';
    default:
      return '검정';
  }
}

/** Font size in pt for a preset, scaled down slightly for compact (thumbnail) chips. */
export function photoNoteTextSizePt(size: PhotoNoteTextSize, compact: boolean): number {
  const base = compact ? 10 : 13;
  const scale = size === 'small' ? 0.85 : size === 'large' ? 1.3 : 1;
  return Math.max(9, Math.round(base * scale));
}

export function sanitizePhotoNoteTextSize(value?: string | null): PhotoNoteTextSize {
  return value === 'small' || value === 'large' ? value : DEFAULT_PHOTO_NOTE_TEXT_SIZE;
}

export function sanitizePhotoNoteColorKey(
  value?: string | null,
  fallback: PhotoNoteColorKey = DEFAULT_PHOTO_NOTE_TEXT_COLOR,
): PhotoNoteColorKey {
  return (PHOTO_NOTE_COLOR_OPTIONS as string[]).includes(value ?? '')
    ? (value as PhotoNoteColorKey)
    : fallback;
}

export function sanitizePhotoNoteOpacity(value?: number | null): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_PHOTO_NOTE_BG_OPACITY;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    return { r: 255, g: 255, b: 255 };
  }
  const n = parseInt(match[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** True-alpha rgba() string for the live editor (React Native View background supports real alpha). */
export function photoNoteBackgroundRgba(colorKey: PhotoNoteColorKey, opacityPercent: number): string {
  const { r, g, b } = hexToRgb(photoNoteColorHex(colorKey));
  const a = sanitizePhotoNoteOpacity(opacityPercent) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Solid hex approximating colorKey blended over a white backdrop at opacityPercent.
 * Used when baking notes into the exported/shared image, since the native image-marker
 * module's text background does not have a confirmed alpha channel.
 */
export function photoNoteBackgroundSolidHexOverWhite(
  colorKey: PhotoNoteColorKey,
  opacityPercent: number,
): string {
  const { r, g, b } = hexToRgb(photoNoteColorHex(colorKey));
  const a = sanitizePhotoNoteOpacity(opacityPercent) / 100;
  const blend = (channel: number) => Math.round(channel * a + 255 * (1 - a));
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(blend(r))}${toHex(blend(g))}${toHex(blend(b))}`.toUpperCase();
}
