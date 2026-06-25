import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { embedExifFromSource } from 'voicestamp-gallery';

import { buildStampOriginalRelativePath, resolveImageUri } from './fileService';
import type { Stamp } from '../types/stamp';

export async function resolveExifSourceUri(
  stamp: Stamp,
  fallbackUri?: string,
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const origUri = resolveImageUri(
    buildStampOriginalRelativePath(stamp.imagePath, stamp.title, stamp.id),
  );
  const origInfo = await FileSystem.getInfoAsync(origUri);
  if (origInfo.exists) {
    return origUri;
  }

  if (fallbackUri) {
    return fallbackUri;
  }

  const mainUri = resolveImageUri(stamp.imagePath);
  const mainInfo = await FileSystem.getInfoAsync(mainUri);
  return mainInfo.exists ? mainUri : null;
}

export async function embedCaptionExif(
  captionUri: string,
  stamp: Stamp,
  sourceUri?: string | null,
): Promise<string> {
  if (Platform.OS !== 'android') {
    return captionUri;
  }

  try {
    const exifSource = sourceUri ?? (await resolveExifSourceUri(stamp));
    const latitude = stamp.latitude ?? null;
    const longitude = stamp.longitude ?? null;
    const embedded = await embedExifFromSource(
      captionUri,
      exifSource,
      latitude,
      longitude,
    );
    return embedded ?? captionUri;
  } catch {
    return captionUri;
  }
}
