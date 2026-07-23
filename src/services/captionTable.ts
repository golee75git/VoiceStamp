import { formatLabeledValue, resolveFieldLabels, type FieldLabels } from './fieldLabels';
import { stampDisplayTitle } from './stampFloor';
import { stampCoordinatesLine } from './stampCoords';
import { stampPlaceLine } from './stampPlace';
import type { CoordsLabelMode } from './settingsService';
import type { Stamp } from '../types/stamp';

export type CaptionTableRow = {
  label: string;
  value: string;
};

export type CaptionTableSource = Pick<Stamp, 'title' | 'memo' | 'floor' | 'placeLabel' | 'extra1' | 'extra2' | 'extra3'> &
  Partial<Pick<Stamp, 'latitude' | 'longitude' | 'createdAt'>>;

/** Rows for caption/PDF table. Empty values omitted. Org/footer stay outside the table. */
export function buildCaptionTableRows(
  stamp: CaptionTableSource,
  fieldLabels: Partial<FieldLabels> | null | undefined,
  options: {
    showDatetime: boolean;
    coordsLabel: CoordsLabelMode;
    includeCoords?: boolean;
  },
): CaptionTableRow[] {
  const labels = resolveFieldLabels(fieldLabels);
  const rows: CaptionTableRow[] = [];

  const titleValue = stampDisplayTitle(
    { title: stamp.title, floor: stamp.floor },
    options.showDatetime,
  ).trim();
  if (titleValue) {
    rows.push({ label: labels.titleFieldLabel, value: titleValue });
  }

  const placeValue = (stampPlaceLine(stamp) ?? '').trim();
  if (placeValue) {
    rows.push({ label: labels.placeFieldLabel, value: placeValue });
  }

  const extra1Value = stamp.extra1?.trim() ?? '';
  if (extra1Value) {
    rows.push({ label: labels.extra1FieldLabel, value: extra1Value });
  }

  const extra2Value = stamp.extra2?.trim() ?? '';
  if (extra2Value) {
    rows.push({ label: labels.extra2FieldLabel, value: extra2Value });
  }

  const extra3Value = stamp.extra3?.trim() ?? '';
  if (extra3Value) {
    rows.push({ label: labels.extra3FieldLabel, value: extra3Value });
  }

  const memoValue = stamp.memo?.trim() ?? '';
  if (memoValue) {
    rows.push({ label: labels.memoFieldLabel, value: memoValue });
  }

  if (options.includeCoords !== false) {
    const coords = stampCoordinatesLine(
      {
        latitude: stamp.latitude ?? null,
        longitude: stamp.longitude ?? null,
      },
      options.coordsLabel,
    );
    if (coords) {
      rows.push({ label: '좌표', value: coords });
    }
  }

  return rows;
}

/** Fallback single-line form when a real table cannot be drawn (e.g. native text overlay). */
export function formatCaptionTablePlainLines(rows: CaptionTableRow[]): string[] {
  return rows.map((row) => formatLabeledValue(row.label, row.value)).filter(Boolean);
}
