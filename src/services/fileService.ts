import * as FileSystem from 'expo-file-system/legacy';

const STAMPS_DIR = 'stamps/';

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
  const dir = await ensureStampsDir();
  const ext = tempUri.toLowerCase().includes('.png') ? 'png' : 'jpg';
  const fileName = `${id}.${ext}`;
  const dest = `${dir}${fileName}`;

  await FileSystem.copyAsync({ from: tempUri, to: dest });

  return `${STAMPS_DIR}${fileName}`;
}

export function resolveImageUri(imagePath: string): string {
  return `${FileSystem.documentDirectory ?? ''}${imagePath}`;
}
