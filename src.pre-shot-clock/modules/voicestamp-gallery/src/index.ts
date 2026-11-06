import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

type VoicestampGalleryNative = {
  saveImageWithDisplayName(
    localUri: string,
    displayName: string,
    albumFolder: string,
  ): Promise<string>;
  embedExifFromSource(
    captionUri: string,
    sourceUri: string | null,
    latitude: number | null,
    longitude: number | null,
  ): Promise<string>;
  /** Bake EXIF Orientation into pixels; returns file URI (may be unchanged). */
  bakeExifOrientation(localUri: string): Promise<string>;
};

let nativeModule: VoicestampGalleryNative | null | undefined;

function getNativeModule(): VoicestampGalleryNative | null {
  if (Platform.OS !== 'android') {
    return null;
  }
  if (nativeModule === undefined) {
    try {
      nativeModule = requireNativeModule<VoicestampGalleryNative>('VoicestampGallery');
    } catch {
      nativeModule = null;
    }
  }
  return nativeModule;
}

export async function saveImageWithDisplayName(
  localUri: string,
  displayName: string,
  albumFolder: string,
): Promise<string | null> {
  const mod = getNativeModule();
  if (!mod) {
    return null;
  }
  return mod.saveImageWithDisplayName(localUri, displayName, albumFolder);
}

export async function embedExifFromSource(
  captionUri: string,
  sourceUri: string | null,
  latitude: number | null,
  longitude: number | null,
): Promise<string | null> {
  const mod = getNativeModule();
  if (!mod) {
    return null;
  }
  return mod.embedExifFromSource(captionUri, sourceUri, latitude, longitude);
}

/** Android: bake EXIF orientation into JPEG pixels for crop/zoom. Other platforms: passthrough. */
export async function bakeExifOrientation(localUri: string): Promise<string> {
  const mod = getNativeModule();
  if (!mod?.bakeExifOrientation) {
    return localUri;
  }
  try {
    const next = await mod.bakeExifOrientation(localUri);
    return next?.trim() ? next : localUri;
  } catch {
    return localUri;
  }
}
