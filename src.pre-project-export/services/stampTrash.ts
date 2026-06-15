import { deleteStampImage } from './fileService';
import {
  countTrashedStamps,
  deleteTrashedStampRows,
  restoreStamp as restoreStampRow,
  softDeleteStamps,
} from './stampRepository';

export async function moveStampsToTrash(ids: string[]): Promise<number> {
  return softDeleteStamps(ids);
}

export async function restoreStampFromTrash(id: string): Promise<boolean> {
  return restoreStampRow(id);
}

export async function getTrashedStampCount(): Promise<number> {
  return countTrashedStamps();
}

export async function emptyTrash(): Promise<number> {
  const trashed = await deleteTrashedStampRows();
  for (const stamp of trashed) {
    await deleteStampImage(stamp.imagePath);
  }
  return trashed.length;
}
