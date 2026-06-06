import * as Location from 'expo-location';

import { getPlaceLabelFromCoords } from './kakaoLocal';

export async function getCurrentPlaceLabel(): Promise<string | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    return null;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return getPlaceLabelFromCoords(position.coords.longitude, position.coords.latitude);
}
