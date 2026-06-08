import { Platform } from 'react-native';

import {
  formatDefaultStampTitle,
  persistImage,
  renameStampImage,
  resolveImageUri,
} from './fileService';
import { saveStampPhotoToGallery } from './galleryService';
import {
  getStampById,
  insertStamp,
  updateStampMetadata,
  updateStampMetadataAndImagePath,
} from './stampRepository';
import type { Stamp } from '../types/stamp';
import { generateId } from '../utils/id';

type SaveStampInput = {
  tempImageUri: string;
  title: string;
  memo: string;
};

function resolveStampTitle(title: string, fallbackTimestamp: number): string {
  const trimmed = title.trim();
  return trimmed || formatDefaultStampTitle(fallbackTimestamp);
}

export async function saveStamp(input: SaveStampInput): Promise<Stamp> {
  const id = generateId();
  const now = Date.now();
  const title = resolveStampTitle(input.title, now);
  const imagePath = await persistImage(input.tempImageUri, title, id);

  if (Platform.OS !== 'web') {
    try {
      await saveStampPhotoToGallery(resolveImageUri(imagePath));
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
  };

  await insertStamp(stamp);
  return stamp;
}

export async function updateStamp(input: { id: string; title: string; memo: string }): Promise<void> {
  const stamp = await getStampById(input.id);
  if (!stamp) {
    throw new Error('스탬프를 찾을 수 없습니다.');
  }

  const title = resolveStampTitle(input.title, stamp.createdAt);
  const memo = input.memo.trim();

  if (title !== stamp.title) {
    const imagePath = await renameStampImage(stamp.imagePath, title, stamp.id);
    await updateStampMetadataAndImagePath(stamp.id, title, memo, imagePath);
    return;
  }

  await updateStampMetadata(stamp.id, title, memo);
}
