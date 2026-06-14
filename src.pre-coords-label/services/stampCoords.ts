import type { CoordsLabelMode } from './settingsService';

export function formatStampCoordinates(
  latitude?: number | null,
  longitude?: number | null,
  labelMode: CoordsLabelMode = 'off',
): string | null {
  if (latitude == null || longitude == null) {
    return null;
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  const numbers = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  if (labelMode === 'gps') {
    return `GPS ${numbers}`;
  }
  if (labelMode === 'coords') {
    return `좌표 ${numbers}`;
  }
  return numbers;
}

export function stampCoordinatesLine(
  stamp: {
    latitude?: number | null;
    longitude?: number | null;
  },
  labelMode: CoordsLabelMode = 'off',
): string | null {
  return formatStampCoordinates(stamp.latitude, stamp.longitude, labelMode);
}
