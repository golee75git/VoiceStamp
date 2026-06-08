import * as FileSystem from 'expo-file-system/legacy';
import { Album, Asset, requestPermissionsAsync } from 'expo-media-library';
import { Platform } from 'react-native';

const LEGACY_GALLERY_ALBUM = 'VoiceStamp';

function toFileUri(uri: string): string {
  if (uri.startsWith('file://')) {
    return uri;
  }
  return `file://${uri}`;
}

async function copyToGalleryCache(localUri: string, preferredFileName?: string): Promise<string> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    return toFileUri(localUri);
  }

  const rawName = preferredFileName?.trim() || `voicestamp_${Date.now()}.jpg`;
  const safeName =
    rawName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^\.+/, '') || `voicestamp_${Date.now()}.jpg`;
  const fileName = safeName.includes('.') ? safeName : `${safeName}.jpg`;
  const dest = `${cacheDir}${fileName}`;

  await FileSystem.copyAsync({ from: localUri, to: dest });
  return toFileUri(dest);
}

async function saveToGalleryAlbum(localUri: string, albumName: string, preferredFileName?: string): Promise<void> {
  const fileUri = await copyToGalleryCache(localUri, preferredFileName);
  const existing = await Album.get(albumName);

  if (existing) {
    await Asset.create(fileUri, existing);
    return;
  }

  await Album.create(albumName, [fileUri], true);
}

export async function saveStampPhotoToGallery(
  localFileUri: string,
  preferredFileName?: string,
  albumName?: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const permission = await requestPermissionsAsync(false);
  if (!permission.granted) {
    return;
  }

  const album = albumName?.trim() || LEGACY_GALLERY_ALBUM;

  try {
    await saveToGalleryAlbum(localFileUri, album, preferredFileName);
  } catch {
    try {
      const fileUri = await copyToGalleryCache(localFileUri, preferredFileName);
      await Asset.create(fileUri);
    } catch {
      // Ignore fallback failure.
    }
  }
}
