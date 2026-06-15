import * as Location from 'expo-location';

import { getPlaceLabelFromCoords } from './kakaoLocal';
import {
  getLastCapturePlaceCache,
  PLACE_CACHE_NEARBY_METERS,
} from './settingsService';
import { haversineMeters } from '../utils/geoDistance';

const GPS_TIMEOUT_MS = 6000;
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;

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

export async function getCurrentLocationSnapshot(): Promise<LocationSnapshot | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    return null;
  }

  const coords = await getCoordsWithCacheFallback();
  if (!coords) {
    return null;
  }

  const placeLabel = await getPlaceLabelFromCoords(coords.longitude, coords.latitude);
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    placeLabel,
  };
}

export async function getCurrentPlaceLabel(): Promise<string | null> {
  const snapshot = await getCurrentLocationSnapshot();
  return snapshot?.placeLabel ?? null;
}

export async function getQuickLastKnownCoords(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
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
