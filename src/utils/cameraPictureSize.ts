import { STAMP_PICTURE_LONG_EDGE_MAX } from '../constants/captureImageBudget';

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

export function pickLargestPictureSize(sizes: string[]): string | undefined {
  if (sizes.length === 0) {
    return undefined;
  }

  return sizes.reduce((best, current) =>
    parsePictureSizePixels(current) > parsePictureSizePixels(best) ? current : best,
  );
}

/**
 * Prefer the largest size whose long edge fits the stamp budget.
 * If none fit, fall back to the overall largest (device may only offer huge sizes).
 */
export function pickPreferredStampPictureSize(sizes: string[]): string | undefined {
  if (sizes.length === 0) {
    return undefined;
  }

  const underBudget = sizes.filter(
    (size) => {
      const longEdge = parsePictureSizeLongEdge(size);
      return longEdge > 0 && longEdge <= STAMP_PICTURE_LONG_EDGE_MAX;
    },
  );

  const pool = underBudget.length > 0 ? underBudget : sizes;
  return pickLargestPictureSize(pool);
}
