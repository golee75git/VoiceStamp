import { pdfDisplayTitle } from './pdfTitleFormat';
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

/** 설정 층 선택 모드와 동일: off | school_only | always */
export type FloorPickerModeLike = 'off' | 'school_only' | 'always';

/** 장소·폴더명 등이 학교로 보이거나 always일 때만 층 적용 허용 */
export function isFloorAllowedForLabels(
  pickerMode: FloorPickerModeLike,
  ...labels: Array<string | null | undefined>
): boolean {
  if (pickerMode === 'off') {
    return false;
  }
  if (pickerMode === 'always') {
    return true;
  }
  return labels.some((label) => isSchoolPlaceLabel(label));
}

/** school_only/off에서 비학교면 층 값을 저장하지 않음 */
export function resolveStampFloor(
  pickerMode: FloorPickerModeLike,
  floor: StampFloor | null | undefined,
  ...labels: Array<string | null | undefined>
): StampFloor | null {
  if (!floor) {
    return null;
  }
  if (!isFloorAllowedForLabels(pickerMode, ...labels)) {
    return null;
  }
  return floor;
}

export function stampDisplayTitle(
  stamp: { title: string; floor?: StampFloor | null },
  showDatetime: boolean,
): string {
  return pdfDisplayTitle(stamp.title, showDatetime);
}
