import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const STAMPS_DIR = 'stamps/';

function isInlineImagePath(imagePath: string): boolean {
  return (
    imagePath.startsWith('data:') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://')
  );
}

async function persistImageWeb(tempUri: string): Promise<string> {
  const response = await fetch(tempUri);
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image'));
    reader.readAsDataURL(blob);
  });
}

export async function ensureStampsDir(): Promise<string> {
  const base = FileSystem.documentDirectory;
  if (!base) {
    throw new Error('documentDirectory is not available');
  }

  const dir = `${base}${STAMPS_DIR}`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  return dir;
}

export async function persistImage(tempUri: string, id: string): Promise<string> {
  if (Platform.OS === 'web') {
    return persistImageWeb(tempUri);
  }

  const dir = await ensureStampsDir();
  const ext = tempUri.toLowerCase().includes('.png') ? 'png' : 'jpg';
  const fileName = `${id}.${ext}`;
  const dest = `${dir}${fileName}`;

  await FileSystem.copyAsync({ from: tempUri, to: dest });

  return `${STAMPS_DIR}${fileName}`;
}

export function resolveImageUri(imagePath: string): string {
  if (isInlineImagePath(imagePath)) {
    return imagePath;
  }

  return `${FileSystem.documentDirectory ?? ''}${imagePath}`;
}
