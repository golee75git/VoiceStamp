import { Platform } from 'react-native';

import {
  buildCaptionGalleryFileName,
  renderStampJpegUri,
  type StampImageExportOptions,
} from './exportStampImage';
import {
  extractStampGroupFromImagePath,
  formatDefaultStampTitle,
  formatStampGroupName,
  moveStampImageToGroup,
  normalizeStampGroupName,
  persistImage,
  persistOriginalImageCopy,
  renameStampImage,
  resolveImageUri,
} from './fileService';
import { moveStampGalleryAlbum, saveStampPhotoToGallery } from './galleryService';
import {
  getCurrentSiteName,
  getGallerySaveMode,
  getMemoTextAlign,
  getPdfShowDatetime,
  getStampTextLayout,
  getTitleTextAlign,
  type GallerySaveMode,
} from './settingsService';
import {
  getStampById,
  insertStamp,
  updateStampGalleryAssetId,
  updateStampMetadata,
  updateStampRecord,
} from './stampRepository';
import type { Stamp } from '../types/stamp';
import { generateId } from '../utils/id';

type SaveStampInput = {
  tempImageUri: string;
  /** Camera/source original kept in app folder and used for gallery "original" modes when cropped. */
  originalTempUri?: string;
  title: string;
  memo: string;
  groupName?: string;
  latitude?: number | null;
  longitude?: number | null;
  captureForExport?: (
    stamp: Stamp,
    options: StampImageExportOptions,
  ) => Promise<string>;
};

function resolveStampTitle(title: string, fallbackTimestamp: number): string {
  const trimmed = title.trim();
  return trimmed || formatDefaultStampTitle(fallbackTimestamp);
}

async function loadExportOptions(): Promise<StampImageExportOptions> {
  const [titleAlign, memoAlign, showDatetime, textLayout] = await Promise.all([
    getTitleTextAlign(),
    getMemoTextAlign(),
    getPdfShowDatetime(),
    getStampTextLayout(),
  ]);

  return { titleAlign, memoAlign, showDatetime, textLayout };
}

async function saveNewStampToGallery(
  stamp: Stamp,
  groupName: string,
  originalUri: string,
  mode: GallerySaveMode,
  captureForExport?: SaveStampInput['captureForExport'],
): Promise<string | null> {
  if (mode === 'original_only') {
    return saveStampPhotoToGallery(originalUri, undefined, groupName);
  }

  const options = await loadExportOptions();
  const captionFileName = buildCaptionGalleryFileName(stamp.title);

  try {
    const captionUri = await renderStampJpegUri(stamp, options, captureForExport);

    if (mode === 'caption_only') {
      return saveStampPhotoToGallery(captionUri, captionFileName, groupName);
    }

    await saveStampPhotoToGallery(originalUri, undefined, groupName);
    return saveStampPhotoToGallery(captionUri, captionFileName, groupName);
  } catch {
    if (mode === 'caption_only') {
      return null;
    }

    return saveStampPhotoToGallery(originalUri, undefined, groupName);
  }
}

function scheduleNewStampGallerySave(
  stamp: Stamp,
  groupName: string,
  galleryOriginalUri: string,
  captureForExport?: SaveStampInput['captureForExport'],
): void {
  void (async () => {
    try {
      const mode = await getGallerySaveMode();
      const galleryAssetId = await saveNewStampToGallery(
        stamp,
        groupName,
        galleryOriginalUri,
        mode,
        captureForExport,
      );
      if (galleryAssetId) {
        await updateStampGalleryAssetId(stamp.id, galleryAssetId);
      }
    } catch {
      // App stamp is already saved; gallery failure is non-fatal.
    }
  })();
}

export async function saveStamp(input: SaveStampInput): Promise<Stamp> {
  const id = generateId();
  const now = Date.now();
  const title = resolveStampTitle(input.title, now);
  const groupName =
    input.groupName !== undefined
      ? normalizeStampGroupName(input.groupName)
      : formatStampGroupName(now, await getCurrentSiteName());

  const copyOriginal =
    input.originalTempUri && input.originalTempUri !== input.tempImageUri
      ? persistOriginalImageCopy(input.originalTempUri, title, id, groupName).catch(() => {})
      : Promise.resolve();

  const imagePath = await Promise.all([
    persistImage(input.tempImageUri, title, id, groupName),
    copyOriginal,
  ]).then(([path]) => path);

  const stamp: Stamp = {
    id,
    title,
    memo: input.memo.trim(),
    imagePath,
    createdAt: now,
    updatedAt: now,
    galleryAssetId: null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
  };

  await insertStamp(stamp);

  if (Platform.OS !== 'web') {
    const galleryOriginalUri =
      input.originalTempUri && input.originalTempUri !== input.tempImageUri
        ? input.originalTempUri
        : resolveImageUri(imagePath);
    scheduleNewStampGallerySave(stamp, groupName, galleryOriginalUri, input.captureForExport);
  }

  return stamp;
}

export async function updateStamp(input: {
  id: string;
  title: string;
  memo: string;
  groupName?: string;
}): Promise<void> {
  const stamp = await getStampById(input.id);
  if (!stamp) {
    throw new Error('?ㅽ꺃?꾨? 李얠쓣 ???놁뒿?덈떎.');
  }

  const title = resolveStampTitle(input.title, stamp.createdAt);
  const memo = input.memo.trim();
  const nextGroup = normalizeStampGroupName(input.groupName ?? '');
  const currentGroup = extractStampGroupFromImagePath(stamp.imagePath) ?? '';
  const groupChanged = nextGroup !== currentGroup;
  const titleChanged = title !== stamp.title;

  let imagePath = stamp.imagePath;
  let galleryAssetId = stamp.galleryAssetId ?? null;

  if (groupChanged) {
    imagePath = await moveStampImageToGroup(imagePath, nextGroup, title, stamp.id);
    if (Platform.OS !== 'web') {
      try {
        galleryAssetId = await moveStampGalleryAlbum(
          galleryAssetId,
          nextGroup,
          resolveImageUri(imagePath),
        );
      } catch {
        // ???대뜑 ?대룞? ?꾨즺??
      }
    }
  } else if (titleChanged) {
    imagePath = await renameStampImage(imagePath, title, stamp.id);
  }

  if (groupChanged || titleChanged || memo !== stamp.memo) {
    await updateStampRecord(stamp.id, title, memo, imagePath, galleryAssetId);
    return;
  }

  await updateStampMetadata(stamp.id, title, memo);
}
