/** Display names for stamp fields (UI + watermark). DB columns stay title / place_label / memo. */

export type FieldLabels = {
  titleFieldLabel: string;
  placeFieldLabel: string;
  memoFieldLabel: string;
};

export const DEFAULT_FIELD_TITLE_LABEL = '제목';
export const DEFAULT_FIELD_PLACE_LABEL = '장소';
export const DEFAULT_FIELD_MEMO_LABEL = '메모';
export const FIELD_LABEL_MAX_LENGTH = 20;

export function sanitizeFieldLabel(text: string, fallback: string): string {
  const cleaned = text.trim().replace(/\s+/g, ' ').slice(0, FIELD_LABEL_MAX_LENGTH);
  return cleaned || fallback;
}

export function resolveFieldLabels(partial?: Partial<FieldLabels> | null): FieldLabels {
  return {
    titleFieldLabel: sanitizeFieldLabel(
      partial?.titleFieldLabel ?? DEFAULT_FIELD_TITLE_LABEL,
      DEFAULT_FIELD_TITLE_LABEL,
    ),
    placeFieldLabel: sanitizeFieldLabel(
      partial?.placeFieldLabel ?? DEFAULT_FIELD_PLACE_LABEL,
      DEFAULT_FIELD_PLACE_LABEL,
    ),
    memoFieldLabel: sanitizeFieldLabel(
      partial?.memoFieldLabel ?? DEFAULT_FIELD_MEMO_LABEL,
      DEFAULT_FIELD_MEMO_LABEL,
    ),
  };
}

/** Empty value → empty string (skip line). */
export function formatLabeledValue(label: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return `${label}: ${trimmed}`;
}
