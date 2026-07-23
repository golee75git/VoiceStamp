import { Image } from 'react-native';
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { bakeExifOrientation } from 'voicestamp-gallery';

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

/**
 * Align pixel buffer with on-screen Image orientation (in-app camera / gallery EXIF).
 * System camera usually already upright — this is a no-op then.
 */
export async function normalizeStampImageForCrop(uri: string): Promise<string> {
  try {
    const baked = await bakeExifOrientation(uri);
    if (baked?.trim()) {
      return baked;
    }
  } catch {
    // fall through to manipulator re-encode
  }
  // Fallback when native module unavailable: re-encode (may bake orientation on some devices).
  try {
    const format = uri.toLowerCase().includes('.png') ? SaveFormat.PNG : SaveFormat.JPEG;
    const result = await manipulateAsync(uri, [], { compress: 1, format });
    return result.uri || uri;
  } catch {
    return uri;
  }
}

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
  // imageWidth/scale mismatches letterboxed contain previews (common for in-app max pictureSize).
  const cropWidth = viewportWidth / totalScale;
  const cropHeight = viewportHeight / totalScale;
  const centerX = imageWidth / 2 - translateX / totalScale;
  const centerY = imageHeight / 2 - translateY / totalScale;

  // Intersect with image bounds — do not shift the window (that changed framing vs screen).
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

const COVER_ASPECT_EPS = 0.02;

/**
 * Crop rect matching CameraView FILL_CENTER (cover): keep only what fits the preview slot.
 * Zoom is applied by CameraX on capture — do not re-apply digital zoom here.
 */
export function computeCoverMatchCropRect(params: {
  viewportWidth: number;
  viewportHeight: number;
  imageWidth: number;
  imageHeight: number;
}): StampCropRect | null {
  const { viewportWidth, viewportHeight, imageWidth, imageHeight } = params;
  if (viewportWidth <= 0 || viewportHeight <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return null;
  }

  const previewAspect = viewportWidth / viewportHeight;
  const imageAspect = imageWidth / imageHeight;
  if (Math.abs(previewAspect - imageAspect) / Math.max(previewAspect, imageAspect) < COVER_ASPECT_EPS) {
    return null;
  }

  const coverScale = Math.max(viewportWidth / imageWidth, viewportHeight / imageHeight);
  if (coverScale <= 0) {
    return null;
  }

  const cropWidth = viewportWidth / coverScale;
  const cropHeight = viewportHeight / coverScale;
  const originX = Math.round((imageWidth - cropWidth) / 2);
  const originY = Math.round((imageHeight - cropHeight) / 2);
  const width = Math.round(cropWidth);
  const height = Math.round(cropHeight);

  if (width < MIN_CROP_SIZE || height < MIN_CROP_SIZE) {
    return null;
  }
  if (originX < 0 || originY < 0 || originX + width > imageWidth || originY + height > imageHeight) {
    const left = Math.max(0, originX);
    const top = Math.max(0, originY);
    const right = Math.min(imageWidth, originX + width);
    const bottom = Math.min(imageHeight, originY + height);
    const w = Math.round(right - left);
    const h = Math.round(bottom - top);
    if (w < MIN_CROP_SIZE || h < MIN_CROP_SIZE) {
      return null;
    }
    return { originX: left, originY: top, width: w, height: h };
  }

  return { originX, originY, width, height };
}

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    );
  });
}

/**
 * Align captured JPEG with in-app camera FILL preview (WYSIWYG save).
 * On failure returns the input URI unchanged.
 */
export async function cropInAppCaptureToPreview(
  imageUri: string,
  viewportWidth: number,
  viewportHeight: number,
): Promise<string> {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return imageUri;
  }

  try {
    const normalizedUri = await normalizeStampImageForCrop(imageUri);
    const { width: imageWidth, height: imageHeight } = await getImageSize(normalizedUri);
    const rect = computeCoverMatchCropRect({
      viewportWidth,
      viewportHeight,
      imageWidth,
      imageHeight,
    });
    if (!rect) {
      return normalizedUri;
    }

    const ext = normalizedUri.toLowerCase().includes('.png') ? SaveFormat.PNG : SaveFormat.JPEG;
    const result = await manipulateAsync(
      normalizedUri,
      [{ crop: rect }],
      { compress: ext === SaveFormat.PNG ? 1 : 0.92, format: ext },
    );
    return result.uri || normalizedUri;
  } catch {
    return imageUri;
  }
}
