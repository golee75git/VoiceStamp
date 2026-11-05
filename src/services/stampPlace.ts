import { formatFloorSuffix } from './stampFloor';
import { getFloorDisplayModeSync } from './floorDisplayMode';
import type { Stamp } from '../types/stamp';

export function stampDisplayPlace(
  stamp: Pick<Stamp, 'placeLabel' | 'floor'>,
): string | null {
  const trimmed = stamp.placeLabel?.trim() ?? '';
  if (!trimmed) {
    return null;
  }
  if (getFloorDisplayModeSync() === 'cursor') {
    return trimmed;
  }
  return trimmed + formatFloorSuffix(stamp.floor);
}

export function stampPlaceLine(stamp: Pick<Stamp, 'placeLabel' | 'floor'>): string | null {
  return stampDisplayPlace(stamp);
}
