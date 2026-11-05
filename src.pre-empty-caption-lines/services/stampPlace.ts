import { formatFloorSuffix } from './stampFloor';
import { getFloorDisplayModeSync } from './floorDisplayMode';
import type { Stamp } from '../types/stamp';

export function stampDisplayPlace(
  stamp: Pick<Stamp, 'placeLabel' | 'floor'>,
): string | null {
  const trimmed = stamp.placeLabel?.trim() ?? '';
  if (getFloorDisplayModeSync() === 'cursor') {
    return trimmed || null;
  }
  const suffix = formatFloorSuffix(stamp.floor);
  if (!trimmed && !suffix) {
    return null;
  }
  if (!trimmed && suffix) {
    return suffix.trim();
  }
  return trimmed + suffix;
}

export function stampPlaceLine(stamp: Pick<Stamp, 'placeLabel' | 'floor'>): string | null {
  return stampDisplayPlace(stamp);
}
