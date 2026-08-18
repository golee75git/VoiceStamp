import { STAMP_PICTURE_LONG_EDGE_MAX } from '../constants/captureImageBudget';

/** 4:3 and 3:4 (portrait) — same family as typical still JPEG. */
const STILL_WIDE = 4 / 3;
const STILL_TALL = 3 / 4;
const STILL_SLACK = 0.03;

export function parsePictureSizePixels(size: string): number {
  const match = size.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) {
    return 0;
  }
  return Number(match[1]) * Number(match[2]);
}

export function parsePictureSizeLongEdge(size: string): number {
  const match = size.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) {
    return 0;
  }
  return Math.max(Number(match[1]), Number(match[2]));
}

function parsePictureSizePair(size: string): { width: number; height: number } | null {
  const match = size.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) {
    return null;
  }
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!(width > 0) || !(height > 0)) {
    return null;
  }
  return { width, height };
}

export function isStillFramePictureSize(size: string): boolean {
  const pair = parsePictureSizePair(size);
  if (!pair) {
    return false;
  }
  const ratio = pair.width / pair.height;
  return Math.abs(ratio - STILL_WIDE) <= STILL_SLACK || Math.abs(ratio - STILL_TALL) <= STILL_SLACK;
}

export function pickLargestPictureSize(sizes: string[]): string | undefined {
  if (sizes.length === 0) {
    return undefined;
  }

  return sizes.reduce((best, current) =>
    parsePictureSizePixels(current) > parsePictureSizePixels(best) ? current : best,
  );
}

function pickSmallestLongEdge(sizes: string[]): string | undefined {
  if (sizes.length === 0) {
    return undefined;
  }
  return sizes.reduce((best, current) =>
    parsePictureSizeLongEdge(current) < parsePictureSizeLongEdge(best) ? current : best,
  );
}

/**
 * Prefer a 4:3 (or 3:4) size under the stamp long-edge budget so live preview
 * and the saved JPEG share the same frame. Then 4:3 nearest the budget, then
 * the previous largest-under-budget fallback.
 */
export function pickPreferredStampPictureSize(sizes: string[]): string | undefined {
  if (sizes.length === 0) {
    return undefined;
  }

  const underBudget = sizes.filter((size) => {
    const longEdge = parsePictureSizeLongEdge(size);
    return longEdge > 0 && longEdge <= STAMP_PICTURE_LONG_EDGE_MAX;
  });

  const stillUnder = underBudget.filter(isStillFramePictureSize);
  if (stillUnder.length > 0) {
    return pickLargestPictureSize(stillUnder);
  }

  const stillAll = sizes.filter(isStillFramePictureSize);
  if (stillAll.length > 0) {
    return pickSmallestLongEdge(stillAll);
  }

  const pool = underBudget.length > 0 ? underBudget : sizes;
  return pickLargestPictureSize(pool);
}
