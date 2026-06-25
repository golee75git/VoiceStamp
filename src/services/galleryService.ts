import * as FileSystem from 'expo-file-system/legacy';
import { Album, Asset, requestPermissionsAsync } from 'expo-media-library';
import { Platform } from 'react-native';
import { saveImageWithDisplayName } from 'voicestamp-gallery';

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

function resolveGalleryDisplayName(preferredFileName?: string): string {
  const raw = preferredFileName?.trim();
  if (!raw) {
    return `VoiceStamp_${Date.now()}.jpg`;
  }

  const cleaned = raw.replace(/[\\/:*?"<>|]/g, '_');
  return cleaned.includes('.') ? cleaned : `${cleaned}.jpg`;
}

function buildAsciiGalleryCacheFileName(): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `vs_${Date.now()}_${suffix}.jpg`;
}

function sanitizeAsciiGalleryCacheFileName(preferredFileName?: string): string {
  const rawName = preferredFileName?.trim() || buildAsciiGalleryCacheFileName();
  const safeName =
    rawName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^\.+/, '') || buildAsciiGalleryCacheFileName();
  return safeName.includes('.') ? safeName : `${safeName}.jpg`;
}

async function copyToAsciiGalleryCache(localUri: string): Promise<string> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    return toFileUri(localUri);
  }

  const dest = `${cacheDir}${buildAsciiGalleryCacheFileName()}`;
  await FileSystem.copyAsync({ from: localUri, to: dest });
  return toFileUri(dest);
}

async function copyToAsciiGalleryCacheWithName(localUri: string, preferredFileName?: string): Promise<string> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    return toFileUri(localUri);
  }

  const fileName = sanitizeAsciiGalleryCacheFileName(preferredFileName);
  const dest = `${cacheDir}${fileName}`;

  await FileSystem.copyAsync({ from: localUri, to: dest });
  return toFileUri(dest);
}

async function saveViaNativeDisplayName(
  localUri: string,
  displayName: string,
  albumName: string,
): Promise<string | null> {
  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    const asciiUri = await copyToAsciiGalleryCache(localUri);
    return await saveImageWithDisplayName(asciiUri, displayName, albumName);
  } catch {
    return null;
  }
}

async function saveToGalleryAlbumFallback(
  localUri: string,
  albumName: string,
  preferredFileName?: string,
): Promise<string | null> {
  const fileUri = await copyToAsciiGalleryCacheWithName(localUri, preferredFileName);
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

async function saveToGalleryAlbum(
  localUri: string,
  albumName: string,
  preferredFileName?: string,
): Promise<string | null> {
  const displayName = resolveGalleryDisplayName(preferredFileName);
  const nativeAssetId = await saveViaNativeDisplayName(localUri, displayName, albumName);
  if (nativeAssetId) {
    return nativeAssetId;
  }

  return saveToGalleryAlbumFallback(localUri, albumName, preferredFileName);
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
      const fileUri = await copyToAsciiGalleryCacheWithName(localFileUri, preferredFileName);
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

  if (assetId && !assetId.startsWith('content://')) {
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
