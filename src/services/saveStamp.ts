import { Platform } from 'react-native';

import { embedCaptionExif } from './embedCaptionExif';
import { renderStampJpegUri, type StampImageExportOptions } from './exportStampImage';
import {
  buildGalleryOriginalFileName,
  buildGalleryStampFileName,
  ensureStampOriginalCopy,
  extractStampGroupFromImagePath,
  formatDefaultStampTitle,
  formatStampGroupName,
  moveStampImageToGroup,
  normalizeStampGroupName,
  persistImage,
  persistOriginalImageCopy,
  renameStampImage,
  replaceStampMainImage,
  resolveImageUri,
  syncStampOriginalPath,
} from './fileService';
import { moveStampGalleryAlbum, saveStampPhotoToGallery } from './galleryService';
import {
  getCurrentSiteName,
  getGallerySaveMode,
  getMemoFieldLabel,
  getMemoTextAlign,
  getOverlayFooterPhrase,
  getOverlayOrgName,
  getOverlayShowFooterPhrase,
  getOverlayShowOrgName,
  getPdfShowDatetime,
  getExportFooterDatetime,
  getPlaceFieldLabel,
  getStampTextLayout,
  getStampTextSize,
  getWatermarkStyle,
  getCoordsLabelMode,
  getTitleFieldLabel,
  getTitleTextAlign,
  getExtra1FieldLabel,
  getExtra2FieldLabel,
  getExtra3FieldLabel,
  type GallerySaveMode,
} from './settingsService';
import { resolveFieldLabels, type FieldLabels } from './fieldLabels';
import {
  getStampById,
  insertStamp,
  updateStampGalleryAssetId,
  updateStampMetadata,
  updateStampRecord,
} from './stampRepository';
import { ensureStampThumb } from './stampThumb';
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
  floor?: Stamp['floor'];
  placeLabel?: string | null;
  extra1?: string | null;
  extra2?: string | null;
  extra3?: string | null;
  /** Save-time field display names (avoids settings race; stored on stamp). */
  fieldLabels?: Partial<FieldLabels> | null;
  captureForExport?: (
    stamp: Stamp,
    options: StampImageExportOptions,
  ) => Promise<string>;
};

function resolveStampTitle(title: string, fallbackTimestamp: number): string {
  const trimmed = title.trim();
  return trimmed || formatDefaultStampTitle(fallbackTimestamp);
}

async function loadExportOptions(
  labelOverride?: Partial<FieldLabels> | null,
): Promise<StampImageExportOptions> {
  const [
    titleAlign,
    memoAlign,
    showDatetime,
    showFooterDatetime,
    textLayout,
    stampTextSize,
    coordsLabel,
    watermarkStyle,
    orgName,
    footerPhrase,
    showOrgName,
    showFooterPhrase,
    titleFieldLabel,
    placeFieldLabel,
    memoFieldLabel,
    extra1FieldLabel,
    extra2FieldLabel,
    extra3FieldLabel,
  ] = await Promise.all([
    getTitleTextAlign(),
    getMemoTextAlign(),
    getPdfShowDatetime(),
    getExportFooterDatetime(),
    getStampTextLayout(),
    getStampTextSize(),
    getCoordsLabelMode(),
    getWatermarkStyle(),
    getOverlayOrgName(),
    getOverlayFooterPhrase(),
    getOverlayShowOrgName(),
    getOverlayShowFooterPhrase(),
    getTitleFieldLabel(),
    getPlaceFieldLabel(),
    getMemoFieldLabel(),
    getExtra1FieldLabel(),
    getExtra2FieldLabel(),
    getExtra3FieldLabel(),
  ]);

  const labels = resolveFieldLabels({
    titleFieldLabel: labelOverride?.titleFieldLabel ?? titleFieldLabel,
    placeFieldLabel: labelOverride?.placeFieldLabel ?? placeFieldLabel,
    memoFieldLabel: labelOverride?.memoFieldLabel ?? memoFieldLabel,
    extra1FieldLabel: labelOverride?.extra1FieldLabel ?? extra1FieldLabel,
    extra2FieldLabel: labelOverride?.extra2FieldLabel ?? extra2FieldLabel,
    extra3FieldLabel: labelOverride?.extra3FieldLabel ?? extra3FieldLabel,
  });

  return {
    titleAlign,
    memoAlign,
    showDatetime,
    showFooterDatetime,
    textLayout,
    stampTextSize,
    coordsLabel,
    watermarkStyle,
    orgName,
    footerPhrase,
    showOrgName,
    showFooterPhrase,
    ...labels,
  };
}

async function saveNewStampToGallery(
  stamp: Stamp,
  groupName: string,
  originalUri: string,
  mode: GallerySaveMode,
  captureForExport?: SaveStampInput['captureForExport'],
  fieldLabels?: Partial<FieldLabels> | null,
): Promise<string | null> {
  const stampFileName = buildGalleryStampFileName(stamp.title);
  const originalFileName = buildGalleryOriginalFileName(stamp.title);

  if (mode === 'original_only') {
    return saveStampPhotoToGallery(originalUri, originalFileName, groupName);
  }

  const options = await loadExportOptions(fieldLabels ?? {
    titleFieldLabel: stamp.titleFieldLabel,
    placeFieldLabel: stamp.placeFieldLabel,
    memoFieldLabel: stamp.memoFieldLabel,
    extra1FieldLabel: stamp.extra1FieldLabel,
    extra2FieldLabel: stamp.extra2FieldLabel,
    extra3FieldLabel: stamp.extra3FieldLabel,
  });

  try {
    const captionUri = await renderStampJpegUri(stamp, options, captureForExport);
    const captionWithExif = await embedCaptionExif(captionUri, stamp, originalUri);

    if (mode === 'caption_only') {
      return saveStampPhotoToGallery(captionWithExif, stampFileName, groupName);
    }

    await saveStampPhotoToGallery(originalUri, originalFileName, groupName);
    return saveStampPhotoToGallery(captionWithExif, stampFileName, groupName);
  } catch {
    if (mode === 'caption_only') {
      return null;
    }

    return saveStampPhotoToGallery(originalUri, originalFileName, groupName);
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
      if (mode === 'app_only') {
        return;
      }
      const galleryAssetId = await saveNewStampToGallery(
        stamp,
        groupName,
        galleryOriginalUri,
        mode,
        captureForExport,
        {
          titleFieldLabel: stamp.titleFieldLabel,
          placeFieldLabel: stamp.placeFieldLabel,
          memoFieldLabel: stamp.memoFieldLabel,
          extra1FieldLabel: stamp.extra1FieldLabel,
          extra2FieldLabel: stamp.extra2FieldLabel,
          extra3FieldLabel: stamp.extra3FieldLabel,
        },
      );
      if (galleryAssetId) {
        await updateStampGalleryAssetId(stamp.id, galleryAssetId);
      }
    } catch {
      // App stamp is already saved; gallery failure is non-fatal.
    }
  })();
}

async function saveEditStampCaptionToGallery(
  stamp: Stamp,
  groupName: string,
  captureForExport?: SaveStampInput['captureForExport'],
): Promise<string | null> {
  const mode = await getGallerySaveMode();
  if (mode === 'app_only' || mode === 'original_only') {
    return stamp.galleryAssetId ?? null;
  }

  const options = await loadExportOptions({
    titleFieldLabel: stamp.titleFieldLabel,
    placeFieldLabel: stamp.placeFieldLabel,
    memoFieldLabel: stamp.memoFieldLabel,
    extra1FieldLabel: stamp.extra1FieldLabel,
    extra2FieldLabel: stamp.extra2FieldLabel,
    extra3FieldLabel: stamp.extra3FieldLabel,
  });
  const stampFileName = buildGalleryStampFileName(stamp.title);

  try {
    const captionUri = await renderStampJpegUri(stamp, options, captureForExport);
    const captionWithExif = await embedCaptionExif(captionUri, stamp);
    return saveStampPhotoToGallery(captionWithExif, stampFileName, groupName);
  } catch {
    return stamp.galleryAssetId ?? null;
  }
}

function scheduleEditStampCaptionGallerySave(
  stamp: Stamp,
  groupName: string,
  captureForExport?: SaveStampInput['captureForExport'],
): void {
  void (async () => {
    try {
      const galleryAssetId = await saveEditStampCaptionToGallery(stamp, groupName, captureForExport);
      if (galleryAssetId) {
        await updateStampGalleryAssetId(stamp.id, galleryAssetId);
      }
    } catch {
      // App stamp is already updated; gallery failure is non-fatal.
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
  const fieldLabels = resolveFieldLabels(input.fieldLabels);

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
    floor: input.floor ?? null,
    placeLabel: input.placeLabel?.trim() || null,
    extra1: input.extra1?.trim() || null,
    extra2: input.extra2?.trim() || null,
    extra3: input.extra3?.trim() || null,
    titleFieldLabel: fieldLabels.titleFieldLabel,
    placeFieldLabel: fieldLabels.placeFieldLabel,
    memoFieldLabel: fieldLabels.memoFieldLabel,
    extra1FieldLabel: fieldLabels.extra1FieldLabel,
    extra2FieldLabel: fieldLabels.extra2FieldLabel,
    extra3FieldLabel: fieldLabels.extra3FieldLabel,
  };

  await insertStamp(stamp);

  if (Platform.OS !== 'web') {
    void ensureStampThumb(id, resolveImageUri(imagePath)).catch(() => {});
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
  floor?: Stamp['floor'];
  placeLabel?: string | null;
  extra1?: string | null;
  extra2?: string | null;
  extra3?: string | null;
  fieldLabels?: Partial<FieldLabels> | null;
  croppedImageUri?: string;
  captureForExport?: SaveStampInput['captureForExport'];
}): Promise<void> {
  const stamp = await getStampById(input.id);
  if (!stamp) {
    throw new Error('스탬프를 찾을 수 없습니다.');
  }

  const title = resolveStampTitle(input.title, stamp.createdAt);
  const memo = input.memo.trim();
  const placeLabel = input.placeLabel?.trim() || null;
  const extra1 = input.extra1?.trim() || null;
  const extra2 = input.extra2?.trim() || null;
  const extra3 = input.extra3?.trim() || null;
  const fieldLabels = resolveFieldLabels(
    input.fieldLabels ?? {
      titleFieldLabel: stamp.titleFieldLabel,
      placeFieldLabel: stamp.placeFieldLabel,
      memoFieldLabel: stamp.memoFieldLabel,
      extra1FieldLabel: stamp.extra1FieldLabel,
      extra2FieldLabel: stamp.extra2FieldLabel,
      extra3FieldLabel: stamp.extra3FieldLabel,
    },
  );
  const prevLabels = resolveFieldLabels({
    titleFieldLabel: stamp.titleFieldLabel ?? undefined,
    placeFieldLabel: stamp.placeFieldLabel ?? undefined,
    memoFieldLabel: stamp.memoFieldLabel ?? undefined,
    extra1FieldLabel: stamp.extra1FieldLabel ?? undefined,
    extra2FieldLabel: stamp.extra2FieldLabel ?? undefined,
    extra3FieldLabel: stamp.extra3FieldLabel ?? undefined,
  });
  const labelsChanged =
    fieldLabels.titleFieldLabel !== prevLabels.titleFieldLabel ||
    fieldLabels.placeFieldLabel !== prevLabels.placeFieldLabel ||
    fieldLabels.memoFieldLabel !== prevLabels.memoFieldLabel ||
    fieldLabels.extra1FieldLabel !== prevLabels.extra1FieldLabel ||
    fieldLabels.extra2FieldLabel !== prevLabels.extra2FieldLabel ||
    fieldLabels.extra3FieldLabel !== prevLabels.extra3FieldLabel;
  const nextGroup = normalizeStampGroupName(input.groupName ?? '');
  const currentGroup = extractStampGroupFromImagePath(stamp.imagePath) ?? '';
  const groupChanged = nextGroup !== currentGroup;
  const titleChanged = title !== stamp.title;
  const imageCropped = Boolean(input.croppedImageUri);

  const oldMainPath = stamp.imagePath;
  const oldTitle = stamp.title;

  if (imageCropped && input.croppedImageUri) {
    await ensureStampOriginalCopy(stamp.imagePath, stamp.title, stamp.id);
  }

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
        // Folder move in app is done.
      }
    }
  } else if (titleChanged) {
    imagePath = await renameStampImage(imagePath, title, stamp.id);
  }

  if (oldMainPath !== imagePath || oldTitle !== title) {
    await syncStampOriginalPath(oldMainPath, imagePath, oldTitle, title, stamp.id);
  }

  if (imageCropped && input.croppedImageUri) {
    await replaceStampMainImage(input.croppedImageUri, imagePath);
  }

  const metadataChanged =
    groupChanged ||
    titleChanged ||
    memo !== stamp.memo ||
    imageCropped ||
    (input.floor ?? null) !== (stamp.floor ?? null) ||
    placeLabel !== (stamp.placeLabel?.trim() || null) ||
    extra1 !== (stamp.extra1?.trim() || null) ||
    extra2 !== (stamp.extra2?.trim() || null) ||
    extra3 !== (stamp.extra3?.trim() || null) ||
    labelsChanged;

  if (metadataChanged) {
    await updateStampRecord(
      stamp.id,
      title,
      memo,
      imagePath,
      galleryAssetId,
      input.floor ?? null,
      placeLabel,
      extra1,
      extra2,
      extra3,
      fieldLabels,
    );
  } else {
    await updateStampMetadata(
      stamp.id,
      title,
      memo,
      input.floor ?? null,
      placeLabel,
      extra1,
      extra2,
      extra3,
      fieldLabels,
    );
  }

  if (imageCropped && Platform.OS !== 'web') {
    void ensureStampThumb(stamp.id, resolveImageUri(imagePath), { force: true }).catch(() => {});
    const updatedStamp: Stamp = {
      ...stamp,
      title,
      memo,
      imagePath,
      galleryAssetId,
      floor: input.floor ?? null,
      placeLabel,
      extra1,
      extra2,
      extra3,
      titleFieldLabel: fieldLabels.titleFieldLabel,
      placeFieldLabel: fieldLabels.placeFieldLabel,
      memoFieldLabel: fieldLabels.memoFieldLabel,
      extra1FieldLabel: fieldLabels.extra1FieldLabel,
      extra2FieldLabel: fieldLabels.extra2FieldLabel,
      extra3FieldLabel: fieldLabels.extra3FieldLabel,
      updatedAt: Date.now(),
    };
    scheduleEditStampCaptionGallerySave(
      updatedStamp,
      nextGroup || currentGroup,
      input.captureForExport,
    );
  }
}
