import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

/** App-private JPEG used on caption/watermark compose. */
export const OVERLAY_MARK_REL = 'overlay/mark.jpg';
export const OVERLAY_MARK_MAX_EDGE = 256;
const OVERLAY_MARK_SOURCE_MAX_BYTES = 8 * 1024 * 1024;

function overlayDirUri(): string {
  const base = FileSystem.documentDirectory;
  if (!base) {
    throw new Error('저장 폴더를 쓸 수 없습니다.');
  }
  return `${base}overlay`;
}

export function overlayMarkFileUri(): string {
  return `${FileSystem.documentDirectory ?? ''}${OVERLAY_MARK_REL}`;
}

function isLocalImageUri(uri: string): boolean {
  const trimmed = uri.trim();
  if (!trimmed) {
    return false;
  }
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:')) {
    return false;
  }
  return (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('ph://') ||
    trimmed.startsWith('/')
  );
}

function withFileScheme(uri: string): string {
  if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://')) {
    return uri;
  }
  if (uri.startsWith('/')) {
    return `file://${uri}`;
  }
  return uri;
}

export async function overlayMarkExists(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const info = await FileSystem.getInfoAsync(overlayMarkFileUri());
  return info.exists === true;
}

export async function resolveOverlayMarkFileUri(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }
  const uri = overlayMarkFileUri();
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    return null;
  }
  return withFileScheme(uri);
}

export function overlayMarkDrawSize(photoWidth: number): number {
  return Math.max(48, Math.round(photoWidth * 0.12));
}

export async function pickAndInstallOverlayMark(): Promise<string | null> {
  if (Platform.OS === 'web') {
    throw new Error('표시 그림은 앱에서만 넣을 수 있습니다.');
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('앨범 접근 권한이 필요합니다.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.9,
    exif: false,
  });
  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  const src = result.assets[0].uri;
  if (!isLocalImageUri(src)) {
    throw new Error('기기에 있는 그림만 고를 수 있습니다.');
  }

  const srcInfo = await FileSystem.getInfoAsync(src);
  if (
    srcInfo.exists &&
    'size' in srcInfo &&
    typeof srcInfo.size === 'number' &&
    srcInfo.size > OVERLAY_MARK_SOURCE_MAX_BYTES
  ) {
    throw new Error('그림이 너무 큽니다. 더 작은 파일을 고르세요.');
  }

  const resized = await manipulateAsync(
    src,
    [{ resize: { width: OVERLAY_MARK_MAX_EDGE } }],
    { compress: 0.85, format: SaveFormat.JPEG },
  );

  await FileSystem.makeDirectoryAsync(overlayDirUri(), { intermediates: true });
  const dest = overlayMarkFileUri();
  await FileSystem.deleteAsync(dest, { idempotent: true });
  await FileSystem.copyAsync({ from: resized.uri, to: dest });
  return withFileScheme(dest);
}

export async function clearOverlayMark(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await FileSystem.deleteAsync(overlayMarkFileUri(), { idempotent: true });
}
