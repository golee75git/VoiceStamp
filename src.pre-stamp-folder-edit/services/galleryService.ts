import * as FileSystem from 'expo-file-system/legacy';
import { Album, Asset, requestPermissionsAsync } from 'expo-media-library';
import { Platform } from 'react-native';

import { getGalleryAlbumId, setGalleryAlbumId } from './settingsService';

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
  const storedAlbumId = await getGalleryAlbumId(albumName);

  if (storedAlbumId) {
    try {
      await Asset.create(fileUri, new Album(storedAlbumId));
      return;
    } catch {
      // Stored album id may be stale; create a new album below.
    }
  }

  const album = await Album.create(albumName, [fileUri], true);
  await setGalleryAlbumId(albumName, album.id);
}

export async function saveStampPhotoToGallery(
  localFileUri: string,
  preferredFileName?: string,
  albumName?: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const permission = await requestPermissionsAsync(true);
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
