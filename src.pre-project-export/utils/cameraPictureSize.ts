export function parsePictureSizePixels(size: string): number {
  const match = size.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) {
    return 0;
  }
  return Number(match[1]) * Number(match[2]);
}

export function pickLargestPictureSize(sizes: string[]): string | undefined {
  if (sizes.length === 0) {
    return undefined;
  }

  return sizes.reduce((best, current) =>
    parsePictureSizePixels(current) > parsePictureSizePixels(best) ? current : best,
  );
}
