import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

import { resolveImageUri } from './fileService';
import type { PdfImageQuality } from './settingsService';

type PdfImageProfile = {
  maxWidth: number;
  compress: number;
};

function getProfile(quality: PdfImageQuality): PdfImageProfile | null {
  switch (quality) {
    case 'standard':
      return { maxWidth: 1600, compress: 0.75 };
    case 'compressed':
      return { maxWidth: 1024, compress: 0.55 };
    default:
      return null;
  }
}

async function readOriginalDataUri(imagePath: string): Promise<string> {
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  const uri = resolveImageUri(imagePath);
  const ext = imagePath.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/${ext};base64,${base64}`;
}

async function dataUriToJpegDataUri(
  dataUri: string,
  profile: PdfImageProfile,
): Promise<string> {
  if (Platform.OS === 'web') {
    return compressDataUriOnWeb(dataUri, profile);
  }

  const result = await manipulateAsync(
    dataUri,
    [{ resize: { width: profile.maxWidth } }],
    { compress: profile.compress, format: SaveFormat.JPEG },
  );

  const base64 = await FileSystem.readAsStringAsync(result.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/jpeg;base64,${base64}`;
}

function compressDataUriOnWeb(dataUri: string, profile: PdfImageProfile): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.width > profile.maxWidth ? profile.maxWidth / img.width : 1;
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('이미지 압축을 사용할 수 없습니다.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', profile.compress));
    };
    img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    img.src = dataUri;
  });
}

async function compressFileUri(uri: string, profile: PdfImageProfile): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: profile.maxWidth } }],
    { compress: profile.compress, format: SaveFormat.JPEG },
  );

  const base64 = await FileSystem.readAsStringAsync(result.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/jpeg;base64,${base64}`;
}

export async function readImageDataUriForPdf(
  imagePath: string,
  quality: PdfImageQuality,
): Promise<string> {
  const profile = getProfile(quality);
  if (!profile) {
    return readOriginalDataUri(imagePath);
  }

  if (imagePath.startsWith('data:')) {
    return dataUriToJpegDataUri(imagePath, profile);
  }

  const uri = resolveImageUri(imagePath);
  if (Platform.OS === 'web') {
    const original = await readOriginalDataUri(imagePath);
    return compressDataUriOnWeb(original, profile);
  }

  return compressFileUri(uri, profile);
}
