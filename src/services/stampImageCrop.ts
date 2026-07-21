import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';

export type StampCropViewport = {
  scale: number;
  translateX: number;
  translateY: number;
  viewportWidth: number;
  viewportHeight: number;
  imageWidth: number;
  imageHeight: number;
};

export type StampCropRect = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};

const MIN_CROP_SIZE = 32;

export function isStampCropActive(viewport: StampCropViewport | null): boolean {
  if (!viewport) {
    return false;
  }
  if (viewport.viewportWidth <= 0 || viewport.viewportHeight <= 0) {
    return false;
  }
  if (viewport.imageWidth <= 0 || viewport.imageHeight <= 0) {
    return false;
  }
  return (
    viewport.scale > 1.02 ||
    Math.abs(viewport.translateX) > 8 ||
    Math.abs(viewport.translateY) > 8
  );
}

export function computeStampCropRect(viewport: StampCropViewport): StampCropRect | null {
  const { scale, translateX, translateY, viewportWidth, viewportHeight, imageWidth, imageHeight } =
    viewport;

  if (!isStampCropActive(viewport)) {
    return null;
  }

  const fitScale = Math.min(viewportWidth / imageWidth, viewportHeight / imageHeight);
  const totalScale = fitScale * scale;
  if (totalScale <= 0) {
    return null;
  }

  // Visible area in image pixels = viewport / (contain fit * gesture scale).
  const cropWidth = viewportWidth / totalScale;
  const cropHeight = viewportHeight / totalScale;
  const centerX = imageWidth / 2 - translateX / totalScale;
  const centerY = imageHeight / 2 - translateY / totalScale;

  // Intersect with image bounds — do not shift the window to preserve size
  // (that previously changed framing vs what was on screen).
  const left = Math.max(0, centerX - cropWidth / 2);
  const top = Math.max(0, centerY - cropHeight / 2);
  const right = Math.min(imageWidth, centerX + cropWidth / 2);
  const bottom = Math.min(imageHeight, centerY + cropHeight / 2);

  const originX = Math.round(left);
  const originY = Math.round(top);
  const width = Math.round(right - left);
  const height = Math.round(bottom - top);

  if (width < MIN_CROP_SIZE || height < MIN_CROP_SIZE) {
    return null;
  }

  return { originX, originY, width, height };
}

export async function cropStampImage(
  imageUri: string,
  viewport: StampCropViewport,
): Promise<string> {
  const rect = computeStampCropRect(viewport);
  if (!rect) {
    return imageUri;
  }

  const ext = imageUri.toLowerCase().includes('.png') ? SaveFormat.PNG : SaveFormat.JPEG;
  const result = await manipulateAsync(
    imageUri,
    [{ crop: rect }],
    { compress: ext === SaveFormat.PNG ? 1 : 0.92, format: ext },
  );
  return result.uri;
}
