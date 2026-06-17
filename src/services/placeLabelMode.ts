export type PlaceLabelMode = 'education' | 'public' | 'general';

export const DEFAULT_PLACE_LABEL_MODE = 'education' as const;

let placeLabelModeCache: PlaceLabelMode = DEFAULT_PLACE_LABEL_MODE;

export function getPlaceLabelModeSync(): PlaceLabelMode {
  return placeLabelModeCache;
}

export function setPlaceLabelModeCache(mode: PlaceLabelMode): void {
  placeLabelModeCache = mode;
}

export function sanitizePlaceLabelMode(value: string): PlaceLabelMode {
  if (value === 'public' || value === 'general') {
    return value;
  }
  return 'education';
}

export function placeLabelModeLabel(mode: PlaceLabelMode): string {
  switch (mode) {
    case 'public':
      return '공공기관용';
    case 'general':
      return '일반용';
    default:
      return '교육기관용';
  }
}

export const PLACE_LABEL_MODE_OPTIONS: PlaceLabelMode[] = ['education', 'public', 'general'];
