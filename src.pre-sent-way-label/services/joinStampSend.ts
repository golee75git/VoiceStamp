import { formatDefaultStampTitle } from './fileService';
import type { PickedStampImage } from './pickStampImage';
import {
  setProjectCollectEnabled,
  setProjectJoin,
  type JoinedProjectHistory,
} from './projectCollectSettings';
import { buildJoinAwareDefaultTitle } from './projectImportedStamps';
import { saveStamp } from './saveStamp';
import { findNearestSchool } from './schoolLookup';
import type { Stamp } from '../types/stamp';

/** Local school lookup radius; same 200m used by capture place. */
const SCHOOL_NEAR_M = 200;

export async function connectJoinForSend(item: JoinedProjectHistory): Promise<void> {
  await setProjectCollectEnabled(true);
  await setProjectJoin({
    projectId: item.projectId,
    name: item.name,
    uploadCode: item.uploadCode,
    mark: item.mark,
  });
}

/** Pause so 「보내는 중 n / 전체」 can paint before the next save. */
export function yieldAlbumSendPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 0);
      });
    });
  });
}

export async function savePickedAlbumStamp(
  picked: PickedStampImage,
  projectName: string,
): Promise<Stamp> {
  let placeLabel: string | null = null;
  if (picked.latitude != null && picked.longitude != null) {
    const school = await findNearestSchool(picked.latitude, picked.longitude, SCHOOL_NEAR_M);
    placeLabel = school?.name ?? null;
  }
  const capturedAt = Date.now();
  const title = buildJoinAwareDefaultTitle(projectName, capturedAt, formatDefaultStampTitle);
  return saveStamp({
    tempImageUri: picked.uri,
    title,
    memo: '',
    latitude: picked.latitude,
    longitude: picked.longitude,
    placeLabel,
  });
}
