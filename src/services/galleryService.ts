import * as FileSystem from 'expo-file-system/legacy';
import { Album, Asset, requestPermissionsAsync } from 'expo-media-library';
import { Platform } from 'react-native';

import { normalizeStampGroupName } from './fileService';
import { getGalleryAlbumId, setGalleryAlbumId } from './settingsService';

const LEGACY_GALLERY_ALBUM = 'VoiceStamp';

function toFileUri(uri: string): string {
  if (uri.startsWith('file://')) {
    return uri;
  }
  return `file://${uri}`;
}

function resolveGalleryAlbumName(groupName: string): string {
  const normalized = normalizeStampGroupName(groupName);
  return normalized || LEGACY_GALLERY_ALBUM;
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

async function saveToGalleryAlbum(
  localUri: string,
  albumName: string,
  preferredFileName?: string,
): Promise<string | null> {
  const fileUri = await copyToGalleryCache(localUri, preferredFileName);
  const storedAlbumId = await getGalleryAlbumId(albumName);

  if (storedAlbumId) {
    try {
      const asset = await Asset.create(fileUri, new Album(storedAlbumId));
      return asset.id;
    } catch {
      // Stored album id may be stale; create a new album below.
    }
  }

  try {
    const asset = await Asset.create(fileUri);
    const album = await Album.create(albumName, [asset], true);
    await setGalleryAlbumId(albumName, album.id);
    return asset.id;
  } catch {
    return null;
  }
}

export async function saveStampPhotoToGallery(
  localFileUri: string,
  preferredFileName?: string,
  albumName?: string,
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const permission = await requestPermissionsAsync(true);
  if (!permission.granted) {
    return null;
  }

  const album = resolveGalleryAlbumName(albumName ?? '');

  try {
    return await saveToGalleryAlbum(localFileUri, album, preferredFileName);
  } catch {
    try {
      const fileUri = await copyToGalleryCache(localFileUri, preferredFileName);
      const asset = await Asset.create(fileUri);
      return asset.id;
    } catch {
      return null;
    }
  }
}

export async function moveStampGalleryAlbum(
  assetId: string | null | undefined,
  newGroupName: string,
  localFileUri?: string,
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return assetId ?? null;
  }

  const permission = await requestPermissionsAsync(true);
  if (!permission.granted) {
    return assetId ?? null;
  }

  const albumName = resolveGalleryAlbumName(newGroupName);

  if (assetId) {
    try {
      const asset = new Asset(assetId);
      const storedTargetId = await getGalleryAlbumId(albumName);
      if (storedTargetId) {
        await new Album(storedTargetId).add(asset);
        return assetId;
      }

      const album = await Album.create(albumName, [asset], true);
      await setGalleryAlbumId(albumName, album.id);
      return assetId;
    } catch {
      // Fall through to re-export from app file.
    }
  }

  if (!localFileUri) {
    return assetId ?? null;
  }

  return saveStampPhotoToGallery(localFileUri, undefined, albumName);
}
