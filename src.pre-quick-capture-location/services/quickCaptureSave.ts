import {
  formatDefaultStampTitle,
  formatStampGroupName,
  refreshStampGroupDate,
} from './fileService';
import { getNearbyCachedPlaceLabel, getQuickLastKnownCoords } from './locationService';
import { saveStamp } from './saveStamp';
import {
  getCurrentSiteName,
  getLastFloor,
  setCurrentSiteName,
  setLastCapturePlaceCache,
} from './settingsService';
import type { CaptureStampForExport } from './exportStampImage';

type QuickCaptureSaveInput = {
  tempImageUri: string;
  captureForExport?: CaptureStampForExport;
};

export async function saveQuickCapture(input: QuickCaptureSaveInput): Promise<void> {
  const capturedAt = Date.now();
  const [savedSiteName, lastFloor] = await Promise.all([getCurrentSiteName(), getLastFloor()]);
  const siteName = savedSiteName
    ? refreshStampGroupDate(savedSiteName, capturedAt)
    : formatStampGroupName(capturedAt);

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

  const title = formatDefaultStampTitle(capturedAt, placeLabel);

  await setCurrentSiteName(siteName);
  await saveStamp({
    tempImageUri: input.tempImageUri,
    title,
    memo: '',
    groupName: siteName,
    latitude,
    longitude,
    floor: lastFloor,
    captureForExport: input.captureForExport,
  });

  if (latitude != null && longitude != null && placeLabel) {
    await setLastCapturePlaceCache({
      latitude,
      longitude,
      placeLabel,
    });
  }
}
