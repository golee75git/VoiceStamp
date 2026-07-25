import { Platform } from 'react-native';
import { bakeExifOrientation } from 'voicestamp-gallery';
import { isOcrNativeAvailable, nativeRecognizeText } from 'voicestamp-mlkit';

const OCR_TIMEOUT_MS = 15_000;
export const OCR_TITLE_MAX = 60;
export const OCR_MEMO_MAX = 2000;

export type OcrTitleMemoDraft = {
  title: string;
  memo: string;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, ms);
    promise
      .then((value) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(value);
        }
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(null);
        }
      });
  });
}

async function ensureUprightImageUri(imageUri: string): Promise<string> {
  const trimmed = imageUri.trim();
  if (!trimmed) {
    return trimmed;
  }
  try {
    const baked = await bakeExifOrientation(trimmed);
    return baked?.trim() ? baked : trimmed;
  } catch {
    return trimmed;
  }
}

/** Split OCR text into title (first line) + memo (rest). No generative rewrite. */
export function formatOcrTitleMemo(rawText: string): OcrTitleMemoDraft | null {
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) {
    return null;
  }
  const lines = normalized
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter((line) => line.length > 0);
  if (lines.length === 0) {
    return null;
  }
  const title = lines[0].slice(0, OCR_TITLE_MAX);
  const memo = lines.slice(1).join('\n').slice(0, OCR_MEMO_MAX);
  return { title, memo };
}

export function isOcrTitleMemoSupported(): boolean {
  return Platform.OS === 'android' && isOcrNativeAvailable();
}

/**
 * On-device Korean OCR → title/memo draft.
 * Returns null on unsupported platform, timeout, or empty text.
 */
export async function recognizeTitleMemoFromImage(
  imageUri: string,
): Promise<OcrTitleMemoDraft | null> {
  if (!isOcrTitleMemoSupported() || !imageUri.trim()) {
    return null;
  }
  const uprightUri = await ensureUprightImageUri(imageUri);
  const text = await withTimeout(nativeRecognizeText(uprightUri), OCR_TIMEOUT_MS);
  if (text == null) {
    return null;
  }
  return formatOcrTitleMemo(text);
}
