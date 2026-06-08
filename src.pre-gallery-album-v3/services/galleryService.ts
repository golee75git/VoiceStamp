import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';
import { Platform } from 'react-native';

const LEGACY_GALLERY_ALBUM = 'VoiceStamp';

function toFileUri(uri: string): string {
  if (uri.startsWith('file://')) {
    return uri;
  }
  return `file://${uri}`;
}

async function saveToGalleryAlbumAndroid(localUri: string, albumName: string): Promise<void> {
  const fileUri = toFileUri(localUri);
  const existing = await MediaLibrary.getAlbumAsync(albumName);

  if (existing) {
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    await MediaLibrary.addAssetsToAlbumAsync([asset], existing, true);
    return;
  }

  await MediaLibrary.createAlbumAsync(albumName, undefined, true, fileUri);
}

async function saveToGalleryAlbumIos(localUri: string, albumName: string): Promise<void> {
  const asset = await MediaLibrary.createAssetAsync(localUri);
  const existing = await MediaLibrary.getAlbumAsync(albumName);

  if (existing) {
    await MediaLibrary.addAssetsToAlbumAsync([asset], existing, false);
    return;
  }

  await MediaLibrary.createAlbumAsync(albumName, asset, false);
}

export async function saveStampPhotoToGallery(
  localFileUri: string,
  preferredFileName?: string,
  albumName?: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) {
    return;
  }

  let uri = localFileUri;
  if (preferredFileName) {
    const dir = FileSystem.cacheDirectory;
    if (dir) {
      const dest = `${dir}${preferredFileName}`;
      await FileSystem.copyAsync({ from: localFileUri, to: dest });
      uri = dest;
    }
  }

  const album = albumName?.trim() || LEGACY_GALLERY_ALBUM;

  try {
    if (Platform.OS === 'android') {
      await saveToGalleryAlbumAndroid(uri, album);
      return;
    }

    await saveToGalleryAlbumIos(uri, album);
  } catch {
    // Album grouping failed; createAssetAsync path may still have saved to the library.
    try {
      await MediaLibrary.createAssetAsync(uri);
    } catch {
      // Ignore fallback failure.
    }
  }
}
