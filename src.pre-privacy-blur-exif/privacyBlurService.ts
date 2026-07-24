import { Platform } from 'react-native';
import {
  isPrivacyBlurNativeAvailable,
  nativeApplyBlurRegions,
  nativeDetectPrivacyRegions,
} from 'voicestamp-mlkit';
import type { BlurStrength, PrivacyDetectResult, PrivacyRegion } from './privacyBlurTypes';

const DETECT_TIMEOUT_MS = 15_000;
const BLUR_TIMEOUT_MS = 20_000;

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

function normalizeRegion(raw: {
  id?: string;
  type?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  text?: string | null;
  enabled?: boolean;
}, index: number): PrivacyRegion | null {
  const left = Number(raw.left);
  const top = Number(raw.top);
  const width = Number(raw.width);
  const height = Number(raw.height);
  if (
    !Number.isFinite(left) ||
    !Number.isFinite(top) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }
  const type: PrivacyRegion['type'] = raw.type === 'face' ? 'face' : 'text';
  if (type === 'text') {
    const text = typeof raw.text === 'string' ? raw.text : '';
    if (!/\d/.test(text)) {
      return null;
    }
  }
  return {
    id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : `${type}-${index}`,
    type,
    left,
    top,
    width,
    height,
    text: typeof raw.text === 'string' ? raw.text : undefined,
    enabled: raw.enabled !== false,
  };
}

export function isPrivacyBlurSupported(): boolean {
  return Platform.OS === 'android' && isPrivacyBlurNativeAvailable();
}

export async function detectPrivacyRegions(
  imageUri: string,
): Promise<PrivacyDetectResult | null> {
  if (!isPrivacyBlurSupported() || !imageUri.trim()) {
    return null;
  }
  const result = await withTimeout(nativeDetectPrivacyRegions(imageUri), DETECT_TIMEOUT_MS);
  if (!result) {
    return null;
  }
  const regions: PrivacyRegion[] = [];
  (result.regions ?? []).forEach((raw, index) => {
    const normalized = normalizeRegion(raw, index);
    if (normalized) {
      regions.push(normalized);
    }
  });
  return {
    width: Number(result.width) || 0,
    height: Number(result.height) || 0,
    regions,
  };
}

export async function applyBlurToImage(
  imageUri: string,
  regions: PrivacyRegion[],
  strength: BlurStrength,
): Promise<string | null> {
  if (!isPrivacyBlurSupported() || !imageUri.trim()) {
    return null;
  }
  const enabled = regions.filter((r) => r.enabled);
  if (enabled.length === 0) {
    return null;
  }
  const payload = enabled.map((r) => ({
    id: r.id,
    type: r.type,
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
    text: r.text ?? null,
    enabled: true,
  }));
  return withTimeout(
    nativeApplyBlurRegions(imageUri, JSON.stringify(payload), strength),
    BLUR_TIMEOUT_MS,
  );
}

export function countRegionsByType(regions: PrivacyRegion[]): { faces: number; texts: number } {
  let faces = 0;
  let texts = 0;
  for (const r of regions) {
    if (!r.enabled) {
      continue;
    }
    if (r.type === 'face') {
      faces += 1;
    } else {
      texts += 1;
    }
  }
  return { faces, texts };
}
