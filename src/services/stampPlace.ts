import type { Stamp } from '../types/stamp';

export function stampPlaceLine(stamp: Pick<Stamp, 'placeLabel'>): string | null {
  const trimmed = stamp.placeLabel?.trim();
  return trimmed || null;
}
