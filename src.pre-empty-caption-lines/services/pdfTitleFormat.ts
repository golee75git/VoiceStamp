export function stripDateTimePrefixFromTitle(title: string): string {
  return title.trim().replace(/^\d{8}(?:_\d{4})?_?/, '').trim();
}

export function pdfDisplayTitle(rawTitle: string | undefined, showDatetime: boolean): string {
  const raw = rawTitle?.trim() ?? '';
  if (!raw) {
    return '(제목 없음)';
  }
  if (showDatetime) {
    return raw;
  }
  const stripped = stripDateTimePrefixFromTitle(raw);
  return stripped || '(제목 없음)';
}

/** Bottom caption/PDF line: stamp createdAt in Korean locale. */
export function formatStampFooterDatetime(createdAt: number): string {
  return new Date(createdAt).toLocaleString('ko-KR');
}

export function defaultPdfFileNameFromStampTitle(
  title: string | undefined,
  includeDatetime: boolean,
): string {
  const raw = title?.trim() || '';
  if (!raw) {
    return 'VoiceStamp';
  }
  if (includeDatetime) {
    return raw;
  }
  const stripped = stripDateTimePrefixFromTitle(raw);
  return stripped || 'VoiceStamp';
}

function compactExportNameToken(value: string): string {
  return value.replace(/[_\s]/g, '').toLowerCase();
}

function placeTokenForExportName(placeLabel: string | null | undefined): string {
  const raw = placeLabel?.trim() ?? '';
  if (!raw) {
    return '';
  }
  return raw
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '')
    .replace(/_+/g, '_');
}

/** EXPORT_FILE_PLACE_HOST: 제목 + 장소칸(위치 표시명 포함). 되돌리: restore-export-file-place.bat */
export function defaultExportFileNameFromStamp(
  stamp: { title?: string | null; placeLabel?: string | null } | null | undefined,
  includeDatetime: boolean,
): string {
  const titleBase = defaultPdfFileNameFromStampTitle(stamp?.title ?? undefined, includeDatetime);
  const place = placeTokenForExportName(stamp?.placeLabel);
  if (!place) {
    return titleBase;
  }
  const titleCmp = compactExportNameToken(titleBase);
  const placeCmp = compactExportNameToken(place);
  if (titleCmp.includes(placeCmp) || placeCmp.includes(titleCmp)) {
    return titleBase;
  }
  if (titleBase === 'VoiceStamp') {
    return place;
  }
  return `${titleBase}_${place}`;
}
