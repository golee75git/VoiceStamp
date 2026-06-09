import { Platform } from 'react-native';

import {
  extractStampGroupFromImagePath,
  formatDefaultStampTitle,
  formatStampGroupName,
  moveStampImageToGroup,
  normalizeStampGroupName,
  persistImage,
  renameStampImage,
  resolveImageUri,
} from './fileService';
import { moveStampGalleryAlbum, saveStampPhotoToGallery } from './galleryService';
import { getCurrentSiteName } from './settingsService';
import {
  getStampById,
  insertStamp,
  updateStampMetadata,
  updateStampRecord,
} from './stampRepository';
import type { Stamp } from '../types/stamp';
import { generateId } from '../utils/id';

type SaveStampInput = {
  tempImageUri: string;
  title: string;
  memo: string;
  groupName?: string;
};

function resolveStampTitle(title: string, fallbackTimestamp: number): string {
  const trimmed = title.trim();
  return trimmed || formatDefaultStampTitle(fallbackTimestamp);
}

export async function saveStamp(input: SaveStampInput): Promise<Stamp> {
  const id = generateId();
  const now = Date.now();
  const title = resolveStampTitle(input.title, now);
  const groupName = input.groupName?.trim()
    ? normalizeStampGroupName(input.groupName)
    : formatStampGroupName(now, await getCurrentSiteName());
  const imagePath = await persistImage(input.tempImageUri, title, id, groupName);

  let galleryAssetId: string | null = null;
  if (Platform.OS !== 'web') {
    try {
      galleryAssetId = await saveStampPhotoToGallery(resolveImageUri(imagePath), undefined, groupName);
    } catch {
      // 앱 내부 저장은 완료됨. 갤러리 저장·권한 거부는 저장 실패로 처리하지 않음.
    }
  }

  const stamp: Stamp = {
    id,
    title,
    memo: input.memo.trim(),
    imagePath,
    createdAt: now,
    updatedAt: now,
    galleryAssetId,
  };

  await insertStamp(stamp);
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
    throw new Error('스탬프를 찾을 수 없습니다.');
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
        // 앱 폴더 이동은 완료됨.
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
