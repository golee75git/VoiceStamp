export function formatStampCoordinates(
  latitude?: number | null,
  longitude?: number | null,
): string | null {
  if (latitude == null || longitude == null) {
    return null;
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

export function stampCoordinatesLine(stamp: {
  latitude?: number | null;
  longitude?: number | null;
}): string | null {
  return formatStampCoordinates(stamp.latitude, stamp.longitude);
}
