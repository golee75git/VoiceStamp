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
