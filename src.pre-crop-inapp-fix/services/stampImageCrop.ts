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

  const cropWidth = imageWidth / scale;
  const cropHeight = imageHeight / scale;
  const centerX = imageWidth / 2 - translateX / totalScale;
  const centerY = imageHeight / 2 - translateY / totalScale;

  let originX = Math.round(centerX - cropWidth / 2);
  let originY = Math.round(centerY - cropHeight / 2);
  let width = Math.round(cropWidth);
  let height = Math.round(cropHeight);

  if (width < MIN_CROP_SIZE || height < MIN_CROP_SIZE) {
    return null;
  }

  if (originX < 0) {
    originX = 0;
  }
  if (originY < 0) {
    originY = 0;
  }
  if (originX + width > imageWidth) {
    originX = Math.max(0, imageWidth - width);
  }
  if (originY + height > imageHeight) {
    originY = Math.max(0, imageHeight - height);
  }

  width = Math.min(width, imageWidth - originX);
  height = Math.min(height, imageHeight - originY);

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
