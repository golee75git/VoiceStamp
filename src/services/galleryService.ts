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

export async function saveStampPhotoToGallery(localFileUri: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const permission = await MediaLibrary.requestPermissionsAsync(true);
  if (!permission.granted) {
    return;
  }

  const asset = await MediaLibrary.createAssetAsync(localFileUri);
  await ensureGalleryAlbum(asset);
}
