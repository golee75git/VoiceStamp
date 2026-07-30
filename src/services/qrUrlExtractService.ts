/**
 * Extract / normalize http(s) URLs from OCR text for QR caption.
 * Does not fetch or open URLs. Rejects non-http schemes.
 */
import { Platform } from 'react-native';
import { bakeExifOrientation } from 'voicestamp-gallery';
import { isOcrNativeAvailable, nativeRecognizeText } from 'voicestamp-mlkit';

export const SOURCE_URL_MAX_LEN = 2048;
const OCR_TIMEOUT_MS = 15_000;

const HTTP_URL_RE = /https?:\/\/[^\s<>"'`）\]\}|,]+/gi;
const WWW_URL_RE = /(?:^|[\s([{「『])((?:www\.)[a-z0-9][-a-z0-9.]+\.[a-z]{2,}(?:\/[^\s<>"'`]*)?)/gi;

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

function stripTrailingJunk(url: string): string {
  return url.replace(/[.,;:!?)\]}>」』]+$/g, '');
}

/**
 * Accept only http/https. Strips credentials. Caps length.
 */
export function normalizeHttpUrl(raw: string): string | null {
  const trimmed = stripTrailingJunk(raw.trim());
  if (!trimmed || trimmed.length > SOURCE_URL_MAX_LEN) {
    return null;
  }
  let candidate = trimmed;
  if (/^www\./i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    return null;
  }
  if (parsed.username || parsed.password) {
    return null;
  }
  const href = parsed.toString();
  if (href.length > SOURCE_URL_MAX_LEN) {
    return null;
  }
  return href;
}

export function extractHttpUrlsFromText(rawText: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const n = normalizeHttpUrl(raw);
    if (!n || seen.has(n)) {
      return;
    }
    seen.add(n);
    found.push(n);
  };

  const httpMatches = rawText.match(HTTP_URL_RE) ?? [];
  for (const m of httpMatches) {
    push(m);
  }

  WWW_URL_RE.lastIndex = 0;
  let wwwMatch: RegExpExecArray | null;
  while ((wwwMatch = WWW_URL_RE.exec(rawText)) !== null) {
    push(wwwMatch[1]);
  }

  return found;
}

export function isQrUrlExtractSupported(): boolean {
  return Platform.OS === 'android' && isOcrNativeAvailable();
}

/**
 * On-device OCR → unique http(s) URL candidates (Android).
 * Returns [] on unsupported platform / timeout / none found.
 */
export async function extractHttpUrlsFromImage(imageUri: string): Promise<string[]> {
  if (!isQrUrlExtractSupported() || !imageUri.trim()) {
    return [];
  }
  const uprightUri = await ensureUprightImageUri(imageUri);
  const text = await withTimeout(nativeRecognizeText(uprightUri), OCR_TIMEOUT_MS);
  if (text == null || !text.trim()) {
    return [];
  }
  return extractHttpUrlsFromText(text);
}
