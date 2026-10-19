import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import {
  STAMP_CAPTURE_JPEG_QUALITY,
  STAMP_PICTURE_LONG_EDGE_MAX,
} from '../constants/captureImageBudget';
import { getStampsFolderName } from './settingsService';
import { getTitleDatetimeModeSync } from './titleDatetimeMode';

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
  const mode = getTitleDatetimeModeSync();
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, '0');
  const datePart = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const placePart = place ? sanitizePlaceForTitle(place) : '';

  let prefix = '';
  if (mode === 'datetime') {
    prefix = `${datePart}_${pad(date.getHours())}${pad(date.getMinutes())}`;
  } else if (mode === 'date') {
    prefix = datePart;
  }

  if (!prefix) {
    return placePart;
  }
  return placePart ? `${prefix}_${placePart}` : prefix;
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

export function buildStampOriginalFileName(title: string, id: string, ext: string): string {
  const base = sanitizeStampFileBaseName(title);
  return `${base}_${shortIdFromStampId(id)}_orig.${ext}`;
}

export function buildGalleryStampFileName(title: string): string {
  return `${sanitizeStampFileBaseName(title.trim() || 'VoiceStamp')}.jpg`;
}

export function buildGalleryOriginalFileName(title: string): string {
  return `${sanitizeStampFileBaseName(title.trim() || 'VoiceStamp')}_orig.jpg`;
}

export function formatStampGroupName(timestamp: number, siteName?: string): string {
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, '0');
  const datePart = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const placePart = siteName?.trim() ? sanitizePlaceForTitle(siteName) : '';
  if (!placePart) {
    return datePart;
  }
  return `${datePart}_${placePart}`;
}

export function refreshStampGroupDate(groupName: string, timestamp: number): string {
  const normalized = normalizeStampGroupName(groupName);
  if (!normalized) {
    return formatStampGroupName(timestamp);
  }

  const withPlace = /^(\d{8})_(.+)$/.exec(normalized);
  if (withPlace) {
    return formatStampGroupName(timestamp, withPlace[2]);
  }

  if (/^\d{8}$/.test(normalized)) {
    return formatStampGroupName(timestamp);
  }

  return formatStampGroupName(timestamp, normalized);
}

export function extractStampGroupFromImagePath(imagePath: string): string | null {
  const parts = imagePath.split('/');
  if (parts.length >= 3) {
    return parts[1] ?? null;
  }
  return null;
}

export function normalizeStampGroupName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }
  return sanitizeStampFileBaseName(trimmed);
}

function stampRelativeDir(imagePath: string): string {
  const lastSlash = imagePath.lastIndexOf('/');
  if (lastSlash < 0) {
    return '';
  }
  return imagePath.substring(0, lastSlash + 1);
}

/**
 * Browser stamp persist: paint into canvas (long-edge cap) then JPEG data URL.
 * Avoids fetch(blob:) failures after the picker releases the temporary URI.
 * Uses the same canvas approach already used for web PDF image prep in this repo.
 */
function encodeWebStampImage(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
      reject(new Error('웹에서 사진을 저장할 수 없습니다.'));
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const rawW = img.naturalWidth || img.width || 0;
        const rawH = img.naturalHeight || img.height || 0;
        if (rawW < 1 || rawH < 1) {
          reject(new Error('사진 크기를 확인할 수 없습니다.'));
          return;
        }
        const longEdge = Math.max(rawW, rawH);
        const scale =
          longEdge > STAMP_PICTURE_LONG_EDGE_MAX ? STAMP_PICTURE_LONG_EDGE_MAX / longEdge : 1;
        const width = Math.max(1, Math.round(rawW * scale));
        const height = Math.max(1, Math.round(rawH * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('사진을 브라우저에 담지 못했습니다.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', STAMP_CAPTURE_JPEG_QUALITY));
      } catch {
        reject(new Error('사진을 읽지 못했습니다.'));
      }
    };
    img.onerror = () => {
      reject(new Error('사진을 불러오지 못했습니다. 다시 선택해 주세요.'));
    };
    img.src = uri;
  });
}

async function persistImageWeb(tempUri: string): Promise<string> {
  const source = tempUri.trim();
  if (!source) {
    throw new Error('저장할 사진이 없습니다.');
  }
  return encodeWebStampImage(source);
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

export async function ensureStampGroupDir(groupName: string): Promise<string> {
  const rootDir = await ensureStampsDir();
  const safeGroup = sanitizeStampFileBaseName(groupName);
  const dir = `${rootDir}${safeGroup}/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export async function persistImage(
  tempUri: string,
  title: string,
  id: string,
  groupName?: string,
): Promise<string> {
  if (Platform.OS === 'web') {
    return persistImageWeb(tempUri);
  }

  const folderName = await getStampsFolderName();
  const ext = tempUri.toLowerCase().includes('.png') ? 'png' : 'jpg';
  const fileName = buildStampImageFileName(title, id, ext);
  const safeGroup = groupName?.trim() ? sanitizeStampFileBaseName(groupName) : '';

  if (safeGroup) {
    const dir = await ensureStampGroupDir(safeGroup);
    const dest = `${dir}${fileName}`;
    await FileSystem.copyAsync({ from: tempUri, to: dest });
    return `${folderName}/${safeGroup}/${fileName}`;
  }

  const dir = await ensureStampsDir();
  const dest = `${dir}${fileName}`;
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  return `${folderName}/${fileName}`;
}

export async function persistOriginalImageCopy(
  tempUri: string,
  title: string,
  id: string,
  groupName?: string,
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  const folderName = await getStampsFolderName();
  const ext = tempUri.toLowerCase().includes('.png') ? 'png' : 'jpg';
  const fileName = buildStampOriginalFileName(title, id, ext);
  const safeGroup = groupName?.trim() ? sanitizeStampFileBaseName(groupName) : '';

  if (safeGroup) {
    const dir = await ensureStampGroupDir(safeGroup);
    const dest = `${dir}${fileName}`;
    await FileSystem.copyAsync({ from: tempUri, to: dest });
    return `${folderName}/${safeGroup}/${fileName}`;
  }

  const dir = await ensureStampsDir();
  const dest = `${dir}${fileName}`;
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  return `${folderName}/${fileName}`;
}

export function buildStampOriginalRelativePath(
  imagePath: string,
  title: string,
  id: string,
): string {
  const ext = imagePath.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
  return `${stampRelativeDir(imagePath)}${buildStampOriginalFileName(title, id, ext)}`;
}

export async function ensureStampOriginalCopy(
  imagePath: string,
  title: string,
  id: string,
): Promise<void> {
  if (Platform.OS === 'web' || isInlineImagePath(imagePath)) {
    return;
  }

  const origUri = resolveImageUri(buildStampOriginalRelativePath(imagePath, title, id));
  const origInfo = await FileSystem.getInfoAsync(origUri);
  if (origInfo.exists) {
    return;
  }

  const mainUri = resolveImageUri(imagePath);
  const mainInfo = await FileSystem.getInfoAsync(mainUri);
  if (!mainInfo.exists) {
    return;
  }

  await FileSystem.copyAsync({ from: mainUri, to: origUri });
}

export async function replaceStampMainImage(tempUri: string, imagePath: string): Promise<void> {
  if (Platform.OS === 'web' || isInlineImagePath(imagePath)) {
    return;
  }

  await FileSystem.copyAsync({ from: tempUri, to: resolveImageUri(imagePath) });
}

export async function syncStampOriginalPath(
  oldMainPath: string,
  newMainPath: string,
  oldTitle: string,
  newTitle: string,
  id: string,
): Promise<void> {
  if (Platform.OS === 'web' || isInlineImagePath(oldMainPath) || isInlineImagePath(newMainPath)) {
    return;
  }

  const oldOrigUri = resolveImageUri(buildStampOriginalRelativePath(oldMainPath, oldTitle, id));
  const oldInfo = await FileSystem.getInfoAsync(oldOrigUri);
  if (!oldInfo.exists) {
    return;
  }

  const newOrigUri = resolveImageUri(buildStampOriginalRelativePath(newMainPath, newTitle, id));
  if (oldOrigUri === newOrigUri) {
    return;
  }

  const newInfo = await FileSystem.getInfoAsync(newOrigUri);
  if (newInfo.exists) {
    return;
  }

  await FileSystem.moveAsync({ from: oldOrigUri, to: newOrigUri });
}

export async function moveStampImageToGroup(
  imagePath: string,
  newGroupName: string,
  title: string,
  id: string,
): Promise<string> {
  if (Platform.OS === 'web' || isInlineImagePath(imagePath)) {
    return imagePath;
  }

  const folderName = await getStampsFolderName();
  const ext = imagePath.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
  const fileName = buildStampImageFileName(title, id, ext);
  const safeGroup = normalizeStampGroupName(newGroupName);

  let nextPath: string;
  let destUri: string;

  if (safeGroup) {
    const dir = await ensureStampGroupDir(safeGroup);
    destUri = `${dir}${fileName}`;
    nextPath = `${folderName}/${safeGroup}/${fileName}`;
  } else {
    const dir = await ensureStampsDir();
    destUri = `${dir}${fileName}`;
    nextPath = `${folderName}/${fileName}`;
  }

  if (nextPath === imagePath) {
    return imagePath;
  }

  const from = resolveImageUri(imagePath);
  if (from === destUri) {
    return nextPath;
  }

  const oldInfo = await FileSystem.getInfoAsync(from);
  if (!oldInfo.exists) {
    return imagePath;
  }

  await FileSystem.moveAsync({ from, to: destUri });
  return nextPath;
}

export async function renameStampImage(
  imagePath: string,
  title: string,
  id: string,
): Promise<string> {
  if (Platform.OS === 'web' || isInlineImagePath(imagePath)) {
    return imagePath;
  }

  const ext = imagePath.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
  const fileName = buildStampImageFileName(title, id, ext);
  const relativeDir = stampRelativeDir(imagePath);
  const nextPath = `${relativeDir}${fileName}`;

  if (nextPath === imagePath) {
    return imagePath;
  }

  const from = resolveImageUri(imagePath);
  const to = resolveImageUri(nextPath);

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

export async function deleteStampImage(imagePath: string): Promise<void> {
  if (Platform.OS === 'web' || isInlineImagePath(imagePath)) {
    return;
  }

  const uri = resolveImageUri(imagePath);
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}
