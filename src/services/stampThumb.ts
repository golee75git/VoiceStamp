import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

/** 목록·휴지통 카드용. 원본은 수정/내보내기에서만 사용. */
const THUMB_MAX_WIDTH = 360;
const THUMB_COMPRESS = 0.72;
const THUMB_DIR_NAME = 'thumbs';
const MAX_CONCURRENT = 2;

const inFlight = new Map<string, Promise<string>>();
let activeCount = 0;
const waitQueue: Array<() => void> = [];

async function withThumbSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (activeCount >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => {
      waitQueue.push(resolve);
    });
  }
  activeCount += 1;
  try {
    return await fn();
  } finally {
    activeCount -= 1;
    const next = waitQueue.shift();
    if (next) {
      next();
    }
  }
}

function thumbsDir(): string {
  return `${FileSystem.documentDirectory ?? ''}${THUMB_DIR_NAME}/`;
}

export function resolveStampThumbUri(id: string): string {
  return `${thumbsDir()}${id}.jpg`;
}

async function ensureThumbsDir(): Promise<void> {
  const dir = thumbsDir();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export async function stampThumbExists(id: string): Promise<boolean> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return false;
  }
  const info = await FileSystem.getInfoAsync(resolveStampThumbUri(id));
  return info.exists;
}

/**
 * 목록용 썸네일 보장. 이미 있으면 재사용, force면 다시 생성.
 * web은 sourceUri를 그대로 반환.
 */
export async function ensureStampThumb(
  id: string,
  sourceUri: string,
  options?: { force?: boolean },
): Promise<string> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return sourceUri;
  }
  if (!id || !sourceUri) {
    return sourceUri;
  }

  const existing = inFlight.get(id);
  if (existing && !options?.force) {
    return existing;
  }

  const work = withThumbSlot(async () => {
    const thumbUri = resolveStampThumbUri(id);
    if (!options?.force) {
      const info = await FileSystem.getInfoAsync(thumbUri);
      if (info.exists) {
        return thumbUri;
      }
    }

    await ensureThumbsDir();
    const result = await manipulateAsync(
      sourceUri,
      [{ resize: { width: THUMB_MAX_WIDTH } }],
      { compress: THUMB_COMPRESS, format: SaveFormat.JPEG },
    );
    const destInfo = await FileSystem.getInfoAsync(thumbUri);
    if (destInfo.exists) {
      await FileSystem.deleteAsync(thumbUri, { idempotent: true });
    }
    await FileSystem.copyAsync({ from: result.uri, to: thumbUri });
    return thumbUri;
  });

  inFlight.set(id, work);
  try {
    return await work;
  } finally {
    if (inFlight.get(id) === work) {
      inFlight.delete(id);
    }
  }
}

export async function deleteStampThumb(id: string): Promise<void> {
  if (Platform.OS === 'web' || !id || !FileSystem.documentDirectory) {
    return;
  }
  const uri = resolveStampThumbUri(id);
  await FileSystem.deleteAsync(uri, { idempotent: true });
}

/** 보이는 항목 위주로 백그라운드 생성 (실패 무시) */
export function scheduleStampThumbs(
  items: Array<{ id: string; imagePath: string }>,
  resolveFullUri: (imagePath: string) => string,
  limit = 24,
): void {
  if (Platform.OS === 'web') {
    return;
  }
  const slice = items.slice(0, limit);
  void (async () => {
    for (const item of slice) {
      try {
        await ensureStampThumb(item.id, resolveFullUri(item.imagePath));
      } catch {
        // 목록은 원본 폴백
      }
    }
  })();
}
