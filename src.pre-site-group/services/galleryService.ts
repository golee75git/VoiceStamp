import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';
import { Platform } from 'react-native';

const GALLERY_ALBUM = 'VoiceStamp';

async function ensureGalleryAlbum(asset: MediaLibrary.Asset): Promise<void> {
  const existing = await MediaLibrary.getAlbumAsync(GALLERY_ALBUM);
  if (existing) {
    await MediaLibrary.addAssetsToAlbumAsync([asset], existing, false);
    return;
  }
  await MediaLibrary.createAlbumAsync(GALLERY_ALBUM, asset, false);
}

export async function saveStampPhotoToGallery(
  localFileUri: string,
  preferredFileName?: string,
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

  const asset = await MediaLibrary.createAssetAsync(uri);
  try {
    await ensureGalleryAlbum(asset);
  } catch {
    // createAssetAsync already saved the file; album grouping is best-effort.
  }
}
