import type { Stamp } from '../types/stamp';

function normalizeForSearch(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, '');
}

export function stampMatchesQuery(stamp: Stamp, query: string): boolean {
  const q = normalizeForSearch(query);
  if (!q) {
    return true;
  }
  const title = normalizeForSearch(stamp.title);
  const memo = normalizeForSearch(stamp.memo ?? '');
  const place = normalizeForSearch(stamp.placeLabel ?? '');
  return title.includes(q) || memo.includes(q) || place.includes(q);
}

export function filterStampsByQuery(stamps: Stamp[], query: string): Stamp[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return stamps;
  }
  return stamps.filter((stamp) => stampMatchesQuery(stamp, trimmed));
}
