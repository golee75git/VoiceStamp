import { extractStampGroupFromImagePath } from './fileService';
import { listKnownGalleryAlbumNames } from './settingsService';
import { listStamps } from './stampRepository';

export async function listKnownStampGroupFolders(): Promise<string[]> {
  const [stamps, albumNames] = await Promise.all([listStamps(), listKnownGalleryAlbumNames()]);
  const names = new Set<string>();

  for (const stamp of stamps) {
    const group = extractStampGroupFromImagePath(stamp.imagePath);
    if (group) {
      names.add(group);
    }
  }

  for (const name of albumNames) {
    if (name.trim()) {
      names.add(name);
    }
  }

  return [...names].sort((a, b) => b.localeCompare(a));
}
