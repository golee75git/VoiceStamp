import { persistImage } from './fileService';
import { insertStamp, updateStampMetadata as updateStampInDb } from './stampRepository';
import type { Stamp } from '../types/stamp';
import { generateId } from '../utils/id';

type SaveStampInput = {
  tempImageUri: string;
  title: string;
  memo: string;
};

export async function saveStamp(input: SaveStampInput): Promise<Stamp> {
  const id = generateId();
  const imagePath = await persistImage(input.tempImageUri, id);
  const now = Date.now();

  const stamp: Stamp = {
    id,
    title: input.title.trim(),
    memo: input.memo.trim(),
    imagePath,
    createdAt: now,
    updatedAt: now,
  };

  await insertStamp(stamp);
  return stamp;
}

export async function updateStamp(input: { id: string; title: string; memo: string }): Promise<void> {
  await updateStampInDb(input.id, input.title.trim(), input.memo.trim());
}
