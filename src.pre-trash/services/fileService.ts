import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import { getStampsFolderName } from './settingsService';

const MAX_FILE_BASE_LENGTH = 80;

function isInlineImagePath(imagePath: string): boolean {
  return (
    imagePath.startsWith('data:') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://')
  );
}

function sanitizePlaceForTitle(place: string): string {
  return place
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '')
    .replace(/_+/g, '_');
}

export function formatDefaultStampTitle(timestamp: number, place?: string): string {
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, '0');
  const dateTime = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
  const placePart = place ? sanitizePlaceForTitle(place) : '';
  return placePart ? `${dateTime}_${placePart}` : dateTime;
}

export function sanitizeStampFileBaseName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^\.+/, '');
  const base = cleaned || 'VoiceStamp';
  return base.length > MAX_FILE_BASE_LENGTH ? base.slice(0, MAX_FILE_BASE_LENGTH) : base;
}

function shortIdFromStampId(id: string): string {
  const tail = id.includes('-') ? id.split('-').pop() ?? id : id;
  const safe = tail.replace(/[^a-zA-Z0-9]/g, '');
  return safe.slice(0, 8) || 'stamp';
}

export function buildStampImageFileName(title: string, id: string, ext: string): string {
  const base = sanitizeStampFileBaseName(title);
  return `${base}_${shortIdFromStampId(id)}.${ext}`;
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

  const folderName = await getStampsFolderName();
  const dir = `${base}${folderName}/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  return dir;
}

export async function persistImage(tempUri: string, title: string, id: string): Promise<string> {
  if (Platform.OS === 'web') {
    return persistImageWeb(tempUri);
  }

  const dir = await ensureStampsDir();
  const folderName = await getStampsFolderName();
  const ext = tempUri.toLowerCase().includes('.png') ? 'png' : 'jpg';
  const fileName = buildStampImageFileName(title, id, ext);
  const dest = `${dir}${fileName}`;

  await FileSystem.copyAsync({ from: tempUri, to: dest });

  return `${folderName}/${fileName}`;
}

export async function renameStampImage(
  imagePath: string,
  title: string,
  id: string,
): Promise<string> {
  if (Platform.OS === 'web' || isInlineImagePath(imagePath)) {
    return imagePath;
  }

  const folderName = await getStampsFolderName();
  const ext = imagePath.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
  const fileName = buildStampImageFileName(title, id, ext);
  const nextPath = `${folderName}/${fileName}`;

  if (nextPath === imagePath) {
    return imagePath;
  }

  const dir = await ensureStampsDir();
  const from = resolveImageUri(imagePath);
  const to = `${dir}${fileName}`;

  if (from === to) {
    return nextPath;
  }

  const oldInfo = await FileSystem.getInfoAsync(from);
  if (!oldInfo.exists) {
    return imagePath;
  }

  await FileSystem.moveAsync({ from, to });
  return nextPath;
}

export function resolveImageUri(imagePath: string): string {
  if (isInlineImagePath(imagePath)) {
    return imagePath;
  }

  return `${FileSystem.documentDirectory ?? ''}${imagePath}`;
}
