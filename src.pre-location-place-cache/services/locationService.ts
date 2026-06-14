import * as Location from 'expo-location';

import { getPlaceLabelFromCoords } from './kakaoLocal';

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
