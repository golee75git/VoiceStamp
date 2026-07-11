import {
  formatDefaultStampTitle,
  formatStampGroupName,
  refreshStampGroupDate,
} from './fileService';
import { getNearbyCachedPlaceLabel, getQuickLastKnownCoords } from './locationService';
import { saveStamp } from './saveStamp';
import { resolveStampFloor } from './stampFloor';
import {
  getCurrentSiteName,
  getFloorPickerMode,
  getLastCapturePlaceCache,
  getLastFloor,
  setCurrentSiteName,
  setLastCapturePlaceCache,
} from './settingsService';
import type { CaptureStampForExport } from './exportStampImage';

export type QuickCaptureLocation = {
  latitude: number;
  longitude: number;
  placeLabel: string | null;
};

type QuickCaptureSaveInput = {
  tempImageUri: string;
  captureForExport?: CaptureStampForExport;
  /** 연속 촬영 2장째부터 직전 저장 위치·장소를 그대로 씁니다. */
  reuseLocation?: QuickCaptureLocation;
};

async function resolveQuickCaptureLocation(reuseLocation?: QuickCaptureLocation): Promise<{
  latitude: number | null;
  longitude: number | null;
  placeLabel: string | undefined;
}> {
  if (reuseLocation) {
    return {
      latitude: reuseLocation.latitude,
      longitude: reuseLocation.longitude,
      placeLabel: reuseLocation.placeLabel ?? undefined,
    };
  }

  let latitude: number | null = null;
  let longitude: number | null = null;
  let placeLabel: string | undefined;

  const quickCoords = await getQuickLastKnownCoords();
  if (quickCoords) {
    latitude = quickCoords.latitude;
    longitude = quickCoords.longitude;
    const cachedPlace = await getNearbyCachedPlaceLabel(quickCoords);
    if (cachedPlace) {
      placeLabel = cachedPlace;
    }
  }

  if (latitude == null || longitude == null || !placeLabel) {
    const cache = await getLastCapturePlaceCache();
    if (cache) {
      if (latitude == null || longitude == null) {
        latitude = cache.latitude;
        longitude = cache.longitude;
      }
      if (!placeLabel) {
        placeLabel = cache.placeLabel;
      }
    }
  }

  return { latitude, longitude, placeLabel };
}

export async function saveQuickCapture(
  input: QuickCaptureSaveInput,
): Promise<QuickCaptureLocation | null> {
  const capturedAt = Date.now();
  const [savedSiteName, lastFloor, pickerMode] = await Promise.all([
    getCurrentSiteName(),
    getLastFloor(),
    getFloorPickerMode(),
  ]);
  const siteName = savedSiteName
    ? refreshStampGroupDate(savedSiteName, capturedAt)
    : formatStampGroupName(capturedAt);

  const { latitude, longitude, placeLabel } = await resolveQuickCaptureLocation(input.reuseLocation);

  const title = formatDefaultStampTitle(capturedAt);
  const floor = resolveStampFloor(pickerMode, lastFloor, placeLabel, siteName);

  await setCurrentSiteName(siteName);
  await saveStamp({
    tempImageUri: input.tempImageUri,
    title,
    memo: '',
    groupName: siteName,
    latitude,
    longitude,
    floor,
    placeLabel: placeLabel ?? null,
    captureForExport: input.captureForExport,
  });

  if (latitude != null && longitude != null && placeLabel) {
    await setLastCapturePlaceCache({
      latitude,
      longitude,
      placeLabel,
    });
  }

  if (latitude == null || longitude == null) {
    return null;
  }

  return {
    latitude,
    longitude,
    placeLabel: placeLabel ?? null,
  };
}
