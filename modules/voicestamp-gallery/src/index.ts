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
  /** Original shutter tag as `YYYY:MM:DD HH:mm:ss`, or null. */
  readShotDateTime(localUri: string): Promise<string | null>;
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

const EXIF_CLOCK_TEXT = /^\d{4}:\d{2}:\d{2}[ T]\d{2}:\d{2}/;

/** Android file read of the shutter tag. Other platforms and bad paths return null. */
export async function readShotDateTimeFromFile(
  localUri: string | null | undefined,
): Promise<string | null> {
  const uri = localUri?.trim() ?? '';
  if (!uri || uri.includes('..') || uri.length > 1024) {
    return null;
  }
  const lower = uri.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return null;
  }
  const mod = getNativeModule();
  if (!mod?.readShotDateTime) {
    return null;
  }
  try {
    const raw = await mod.readShotDateTime(uri);
    if (typeof raw !== 'string') {
      return null;
    }
    const trimmed = raw.trim();
    if (!EXIF_CLOCK_TEXT.test(trimmed) || trimmed.length > 32) {
      return null;
    }
    return trimmed.slice(0, 19);
  } catch {
    return null;
  }
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
