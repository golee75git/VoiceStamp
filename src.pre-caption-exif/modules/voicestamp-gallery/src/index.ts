import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

type VoicestampGalleryNative = {
  saveImageWithDisplayName(
    localUri: string,
    displayName: string,
    albumFolder: string,
  ): Promise<string>;
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
