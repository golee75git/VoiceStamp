import * as ImagePicker from 'expo-image-picker';

import { STAMP_CAPTURE_JPEG_QUALITY } from '../constants/captureImageBudget';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: STAMP_CAPTURE_JPEG_QUALITY,
  exif: true,
};

export type PickedStampImage = {
  uri: string;
  latitude: number | null;
  longitude: number | null;
};

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** EXIF GPS 도·분·초 또는 단일 숫자 → 십진 도 */
function dmsToDecimal(value: unknown): number | null {
  const direct = toFiniteNumber(value);
  if (direct != null) {
    return direct;
  }
  if (!Array.isArray(value) || value.length < 1) {
    return null;
  }
  const deg = toFiniteNumber(value[0]) ?? 0;
  const min = toFiniteNumber(value[1]) ?? 0;
  const sec = toFiniteNumber(value[2]) ?? 0;
  return deg + min / 60 + sec / 3600;
}

function applyHemisphere(decimal: number, ref: unknown, negativeRefs: string[]): number {
  if (typeof ref !== 'string') {
    return decimal;
  }
  const upper = ref.trim().toUpperCase();
  if (negativeRefs.includes(upper)) {
    return -Math.abs(decimal);
  }
  return Math.abs(decimal);
}

/** expo-image-picker EXIF 객체에서 위·경도만 읽습니다. */
export function readGpsFromExif(
  exif: Record<string, unknown> | null | undefined,
): { latitude: number; longitude: number } | null {
  if (!exif || typeof exif !== 'object') {
    return null;
  }

  const nested = exif.gps;
  if (nested && typeof nested === 'object') {
    const g = nested as Record<string, unknown>;
    const lat = toFiniteNumber(g.latitude ?? g.Latitude);
    const lon = toFiniteNumber(g.longitude ?? g.Longitude);
    if (lat != null && lon != null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return { latitude: lat, longitude: lon };
    }
  }

  let latitude = dmsToDecimal(exif.GPSLatitude ?? exif.gpsLatitude);
  let longitude = dmsToDecimal(exif.GPSLongitude ?? exif.gpsLongitude);
  if (latitude == null || longitude == null) {
    return null;
  }

  latitude = applyHemisphere(latitude, exif.GPSLatitudeRef ?? exif.gpsLatitudeRef, ['S']);
  longitude = applyHemisphere(longitude, exif.GPSLongitudeRef ?? exif.gpsLongitudeRef, ['W']);

  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return null;
  }
  if (latitude === 0 && longitude === 0) {
    return null;
  }

  return { latitude, longitude };
}

export async function pickImageFromLibrary(): Promise<PickedStampImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('앨범 접근 권한이 필요합니다.');
  }

  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  const asset = result.assets[0];
  const gps = readGpsFromExif(asset.exif as Record<string, unknown> | null | undefined);
  return {
    uri: asset.uri,
    latitude: gps?.latitude ?? null,
    longitude: gps?.longitude ?? null,
  };
}

export async function takePhotoWithSystemCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('카메라 접근 권한이 필요합니다.');
  }

  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}
