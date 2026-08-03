import * as ImagePicker from 'expo-image-picker';

import { STAMP_CAPTURE_JPEG_QUALITY } from '../constants/captureImageBudget';

/** 앨범: 재압축 없이 EXIF GPS 보존을 우선합니다. */
const LIBRARY_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  exif: true,
};

/** 시스템 카메라: 스탬프용 화질 상한 유지. */
const CAMERA_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
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

/** "37/1" · "4520/100" 형태 → 숫자 */
function parseRationalToken(token: string): number | null {
  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }
  const slash = trimmed.indexOf('/');
  if (slash < 0) {
    return toFiniteNumber(trimmed);
  }
  const num = Number(trimmed.slice(0, slash));
  const den = Number(trimmed.slice(slash + 1));
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
    return null;
  }
  return num / den;
}

/** EXIF GPS 도·분·초(배열·유리수 문자열·단일 숫자) → 십진 도 */
function dmsToDecimal(value: unknown): number | null {
  const direct = toFiniteNumber(value);
  if (direct != null) {
    return direct;
  }

  if (typeof value === 'string') {
    const parts = value.split(/[,\s]+/).filter((p) => p.length > 0);
    if (parts.length === 0) {
      return null;
    }
    if (parts.length === 1) {
      return parseRationalToken(parts[0]);
    }
    const deg = parseRationalToken(parts[0]) ?? 0;
    const min = parseRationalToken(parts[1]) ?? 0;
    const sec = parseRationalToken(parts[2] ?? '0') ?? 0;
    return deg + min / 60 + sec / 3600;
  }

  if (!Array.isArray(value) || value.length < 1) {
    return null;
  }

  const partAt = (index: number): number => {
    const raw = value[index];
    if (typeof raw === 'string') {
      return parseRationalToken(raw) ?? 0;
    }
    return toFiniteNumber(raw) ?? 0;
  };

  const deg = partAt(0);
  const min = value.length > 1 ? partAt(1) : 0;
  const sec = value.length > 2 ? partAt(2) : 0;
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
    const lat = dmsToDecimal(g.latitude ?? g.Latitude);
    const lon = dmsToDecimal(g.longitude ?? g.Longitude);
    if (lat != null && lon != null && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      if (!(lat === 0 && lon === 0)) {
        return { latitude: lat, longitude: lon };
      }
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

  const result = await ImagePicker.launchImageLibraryAsync(LIBRARY_PICKER_OPTIONS);
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

  const result = await ImagePicker.launchCameraAsync(CAMERA_PICKER_OPTIONS);
  if (result.canceled || !result.assets[0]?.uri) {
    return null;
  }

  return result.assets[0].uri;
}
