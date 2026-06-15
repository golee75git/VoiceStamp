export type FloorDisplayMode = 'suffix' | 'cursor';

export const DEFAULT_FLOOR_DISPLAY_MODE = 'suffix' as const;

let floorDisplayModeCache: FloorDisplayMode = DEFAULT_FLOOR_DISPLAY_MODE;

export function getFloorDisplayModeSync(): FloorDisplayMode {
  return floorDisplayModeCache;
}

export function setFloorDisplayModeCache(mode: FloorDisplayMode): void {
  floorDisplayModeCache = mode;
}

export function sanitizeFloorDisplayMode(value: string): FloorDisplayMode {
  return value === 'cursor' ? 'cursor' : 'suffix';
}

export function floorDisplayModeLabel(mode: FloorDisplayMode): string {
  return mode === 'cursor' ? '제목 커서에 삽입' : '제목 뒤에 붙이기';
}
