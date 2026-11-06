import { readShotDateTimeFromFile } from 'voicestamp-gallery';

import { resolveExifSourceUri } from './embedCaptionExif';
import type { Stamp } from '../types/stamp';

const MIN_YEAR = 1980;
const MAX_YEAR = 2100;
const EXIF_CLOCK = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/;

function two(n: number): string {
  return String(n).padStart(2, '0');
}

function yearInRange(epochMs: number): boolean {
  const year = new Date(epochMs).getFullYear();
  return year >= MIN_YEAR && year <= MAX_YEAR;
}

/** Keep a millisecond instant only when it falls in a plausible photo year. */
export function normalizeTakenAt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : NaN;
  if (!Number.isFinite(n)) {
    return null;
  }
  const rounded = Math.round(n);
  if (!yearInRange(rounded)) {
    return null;
  }
  return rounded;
}

/**
 * EXIF DateTime is local wall time `YYYY:MM:DD HH:mm:ss` with no zone.
 * Interpret the numbers on this device and do not shift them through UTC.
 */
export function epochFromExifDateTime(raw: string | null | undefined): number | null {
  if (!raw) {
    return null;
  }
  const match = EXIF_CLOCK.exec(raw.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    return null;
  }
  const dt = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (dt.getFullYear() !== year || dt.getMonth() !== month - 1 || dt.getDate() !== day) {
    return null;
  }
  return normalizeTakenAt(dt.getTime());
}

const EXIF_CLOCK_KEYS = [
  'DateTimeOriginal',
  'DateTimeDigitized',
  'DateTime',
] as const;

/** Prefer shutter time, then digitized time, then the file date tag. */
export function readShotEpochFromExif(
  exif: Record<string, unknown> | null | undefined,
): number | null {
  if (!exif || typeof exif !== 'object') {
    return null;
  }
  for (const key of EXIF_CLOCK_KEYS) {
    const value = exif[key];
    if (typeof value === 'string') {
      const epoch = epochFromExifDateTime(value);
      if (epoch != null) {
        return epoch;
      }
    }
  }
  return null;
}

/** Watermark corner text: `2026.11.06 11:19`. Empty when the instant is missing. */
export function formatWatermarkShotClock(epochMs: number | null | undefined): string {
  const epoch = normalizeTakenAt(epochMs);
  if (epoch == null) {
    return '';
  }
  const dt = new Date(epoch);
  return `${dt.getFullYear()}.${two(dt.getMonth() + 1)}.${two(dt.getDate())} ${two(dt.getHours())}:${two(dt.getMinutes())}`;
}

export function estimateShotClockWidth(label: string, fontSize: number): number {
  return Math.ceil(label.length * fontSize * 0.62);
}

/** Top-left of the clock, to the left of a bottom-right QR when one is drawn. */
export function shotClockTopLeft(input: {
  photoWidth: number;
  photoHeight: number;
  barHeight: number;
  fontSize: number;
  textWidth: number;
  qrSize: number;
}): { x: number; y: number } {
  const margin = Math.max(8, Math.round(input.photoWidth * 0.02));
  const block = input.qrSize > 0 ? input.qrSize : Math.round(input.fontSize * 1.35);
  const rightInset = margin + (input.qrSize > 0 ? input.qrSize + margin : 0);
  const x = Math.max(margin, input.photoWidth - rightInset - input.textWidth);
  const bandTop = Math.max(margin, input.photoHeight - input.barHeight - margin - block);
  const y = bandTop + Math.max(0, Math.round((block - input.fontSize) / 2));
  return { x, y };
}

export async function resolveWatermarkShotLabel(
  stamp: Pick<Stamp, 'takenAt' | 'imagePath' | 'title' | 'id'>,
): Promise<string> {
  const stored = formatWatermarkShotClock(stamp.takenAt);
  if (stored) {
    return stored;
  }
  try {
    const uri = await resolveExifSourceUri(stamp as Stamp);
    const raw = await readShotDateTimeFromFile(uri);
    return formatWatermarkShotClock(epochFromExifDateTime(raw));
  } catch {
    return '';
  }
}
