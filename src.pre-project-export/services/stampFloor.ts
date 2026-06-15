import { pdfDisplayTitle } from './pdfTitleFormat';
import { getFloorDisplayModeSync } from './floorDisplayMode';
import type { StampFloor } from '../types/stamp';

export const FLOOR_OPTIONS: { value: StampFloor | null; label: string }[] = [
  { value: null, label: '없음' },
  { value: '1', label: '1층' },
  { value: '2', label: '2층' },
  { value: '3', label: '3층' },
  { value: '4', label: '4층' },
  { value: '5', label: '5층' },
];

export function sanitizeStampFloor(value: string | null | undefined): StampFloor | null {
  if (value === '1' || value === '2' || value === '3' || value === '4' || value === '5') {
    return value;
  }
  return null;
}

export function formatFloorSuffix(floor: StampFloor | null | undefined): string {
  if (!floor) {
    return '';
  }
  return ` ${floor}층`;
}

export function formatFloorInsertText(floor: StampFloor | null | undefined): string {
  if (!floor) {
    return '';
  }
  return ` ${floor}층`;
}

export function isSchoolPlaceLabel(label: string | null | undefined): boolean {
  if (!label?.trim()) {
    return false;
  }
  return /(학교|초등|중학|고등|유치원|대학|대학교|교육청|캠퍼스)/.test(label);
}

export function stampDisplayTitle(
  stamp: { title: string; floor?: StampFloor | null },
  showDatetime: boolean,
): string {
  const base = pdfDisplayTitle(stamp.title, showDatetime);
  if (getFloorDisplayModeSync() === 'cursor') {
    return base;
  }
  const suffix = formatFloorSuffix(stamp.floor);
  if (base === '(제목 없음)' && suffix) {
    return suffix.trim();
  }
  return base + suffix;
}
