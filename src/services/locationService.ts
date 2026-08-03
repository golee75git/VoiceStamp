import * as Location from 'expo-location';

import { getPlaceLabelFromCoords } from './kakaoLocal';
import { findNearestSchool } from './schoolLookup';
import {
  getLastCapturePlaceCache,
  isGpsPlaceEnabled,
  isKakaoPlaceEnabled,
  PLACE_CACHE_NEARBY_METERS,
} from './settingsService';
import { haversineMeters } from '../utils/geoDistance';

const GPS_TIMEOUT_MS = 6000;
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;
/** kakaoLocal SCHOOL_NEAR_RADIUS_M 과 동일 */
const SCHOOL_NEAR_RADIUS_M = 200;

export type LocationSnapshot = {
  latitude: number;
  longitude: number;
  placeLabel: string | null;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ms);
    }),
  ]);
}

async function ensureLocationPermission(): Promise<boolean> {
  if (!(await isGpsPlaceEnabled())) {
    return false;
  }
  const permission = await Location.requestForegroundPermissionsAsync();
  return permission.status === 'granted';
}

async function resolvePlaceLabel(longitude: number, latitude: number): Promise<string | null> {
  if (await isKakaoPlaceEnabled()) {
    return getPlaceLabelFromCoords(longitude, latitude);
  }
  const school = await findNearestSchool(latitude, longitude, SCHOOL_NEAR_RADIUS_M);
  return school?.name ?? null;
}

async function getCoordsWithCacheFallback(): Promise<Location.LocationObjectCoords | null> {
  const lastKnown = await Location.getLastKnownPositionAsync({
    maxAge: LAST_KNOWN_MAX_AGE_MS,
  });

  const fresh = await withTimeout(
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }),
    GPS_TIMEOUT_MS,
  );

  if (fresh) {
    return fresh.coords;
  }
  if (lastKnown) {
    return lastKnown.coords;
  }
  return null;
}

/** Last-known GPS, nearby place cache, or local school DB — no fresh GPS wait. */
export async function getFastLocationSnapshot(): Promise<LocationSnapshot | null> {
  if (!(await ensureLocationPermission())) {
    return null;
  }

  const kakaoEnabled = await isKakaoPlaceEnabled();
  const [lastKnown, placeCache] = await Promise.all([
    Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS }),
    getLastCapturePlaceCache(),
  ]);

  if (!lastKnown && placeCache) {
    if (kakaoEnabled) {
      return {
        latitude: placeCache.latitude,
        longitude: placeCache.longitude,
        placeLabel: placeCache.placeLabel,
      };
    }
    const placeLabel = await resolvePlaceLabel(placeCache.longitude, placeCache.latitude);
    return {
      latitude: placeCache.latitude,
      longitude: placeCache.longitude,
      placeLabel,
    };
  }

  if (!lastKnown) {
    return null;
  }

  const coords = {
    latitude: lastKnown.coords.latitude,
    longitude: lastKnown.coords.longitude,
  };

  if (kakaoEnabled) {
    const cachedPlace = await getNearbyCachedPlaceLabel(coords);
    if (cachedPlace) {
      return { ...coords, placeLabel: cachedPlace };
    }
  }

  const placeLabel = await resolvePlaceLabel(coords.longitude, coords.latitude);
  return { ...coords, placeLabel };
}

export async function getCurrentLocationSnapshot(): Promise<LocationSnapshot | null> {
  if (!(await ensureLocationPermission())) {
    return null;
  }

  const coords = await getCoordsWithCacheFallback();
  if (!coords) {
    return null;
  }

  const placeLabel = await resolvePlaceLabel(coords.longitude, coords.latitude);
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    placeLabel,
  };
}

/** 이미 알고 있는 좌표로 장소명만 채웁니다. 현재 GPS는 쓰지 않습니다. */
export async function getLocationSnapshotFromCoords(
  latitude: number,
  longitude: number,
): Promise<LocationSnapshot | null> {
  if (!(await isGpsPlaceEnabled())) {
    return null;
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return null;
  }

  const placeLabel = await resolvePlaceLabel(longitude, latitude);
  return {
    latitude,
    longitude,
    placeLabel,
  };
}

export async function getCurrentPlaceLabel(): Promise<string | null> {
  const snapshot = await getFastLocationSnapshot();
  if (snapshot?.placeLabel) {
    return snapshot.placeLabel;
  }
  const refined = await getCurrentLocationSnapshot();
  return refined?.placeLabel ?? null;
}

export async function getQuickLastKnownCoords(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (!(await ensureLocationPermission())) {
    return null;
  }

  const lastKnown = await Location.getLastKnownPositionAsync({
    maxAge: LAST_KNOWN_MAX_AGE_MS,
  });
  if (!lastKnown) {
    return null;
  }

  return {
    latitude: lastKnown.coords.latitude,
    longitude: lastKnown.coords.longitude,
  };
}

export async function getNearbyCachedPlaceLabel(coords: {
  latitude: number;
  longitude: number;
}): Promise<string | null> {
  if (!(await isKakaoPlaceEnabled())) {
    return null;
  }

  const cache = await getLastCapturePlaceCache();
  if (!cache) {
    return null;
  }

  const distance = haversineMeters(
    coords.latitude,
    coords.longitude,
    cache.latitude,
    cache.longitude,
  );
  if (distance > PLACE_CACHE_NEARBY_METERS) {
    return null;
  }

  return cache.placeLabel;
}
