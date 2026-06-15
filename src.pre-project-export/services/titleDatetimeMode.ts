export type TitleDatetimeMode = 'none' | 'date' | 'datetime';

export const DEFAULT_TITLE_DATETIME_MODE = 'date' as const;

let titleDatetimeModeCache: TitleDatetimeMode = DEFAULT_TITLE_DATETIME_MODE;

export function getTitleDatetimeModeSync(): TitleDatetimeMode {
  return titleDatetimeModeCache;
}

export function setTitleDatetimeModeCache(mode: TitleDatetimeMode): void {
  titleDatetimeModeCache = mode;
}

export function sanitizeTitleDatetimeMode(value: string): TitleDatetimeMode {
  if (value === 'none' || value === 'datetime') {
    return value;
  }
  return 'date';
}

export function titleDatetimeModeLabel(mode: TitleDatetimeMode): string {
  switch (mode) {
    case 'none':
      return '없음';
    case 'datetime':
      return '날짜+시간';
    default:
      return '날짜';
  }
}
