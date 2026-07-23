/** Display names for stamp fields (UI + watermark). DB columns stay title / place_label / memo / extra1 / extra2. */

export type FieldLabels = {
  titleFieldLabel: string;
  placeFieldLabel: string;
  memoFieldLabel: string;
  extra1FieldLabel: string;
  extra2FieldLabel: string;
};

export const DEFAULT_FIELD_TITLE_LABEL = '제목';
export const DEFAULT_FIELD_PLACE_LABEL = '장소';
export const DEFAULT_FIELD_MEMO_LABEL = '메모';
export const DEFAULT_FIELD_EXTRA1_LABEL = '추가1';
export const DEFAULT_FIELD_EXTRA2_LABEL = '추가2';
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
    extra1FieldLabel: sanitizeFieldLabel(
      partial?.extra1FieldLabel ?? DEFAULT_FIELD_EXTRA1_LABEL,
      DEFAULT_FIELD_EXTRA1_LABEL,
    ),
    extra2FieldLabel: sanitizeFieldLabel(
      partial?.extra2FieldLabel ?? DEFAULT_FIELD_EXTRA2_LABEL,
      DEFAULT_FIELD_EXTRA2_LABEL,
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

/** Labels stored on a stamp row (save-time snapshot), with defaults for legacy rows. */
export function fieldLabelsFromStamp(stamp: {
  titleFieldLabel?: string | null;
  placeFieldLabel?: string | null;
  memoFieldLabel?: string | null;
  extra1FieldLabel?: string | null;
  extra2FieldLabel?: string | null;
} | null | undefined): FieldLabels {
  return resolveFieldLabels({
    titleFieldLabel: stamp?.titleFieldLabel ?? undefined,
    placeFieldLabel: stamp?.placeFieldLabel ?? undefined,
    memoFieldLabel: stamp?.memoFieldLabel ?? undefined,
    extra1FieldLabel: stamp?.extra1FieldLabel ?? undefined,
    extra2FieldLabel: stamp?.extra2FieldLabel ?? undefined,
  });
}
