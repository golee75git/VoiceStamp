import { Platform } from 'react-native';
import { isSceneLabelNativeAvailable, nativeLabelImage } from 'voicestamp-mlkit';
import { translateSceneLabel } from './sceneLabelKo';

export type SceneLabel = { text: string; confidence: number };

const ANALYSIS_TIMEOUT_MS = 8000;
const DEFAULT_MAX_LABELS = 5;
const DEFAULT_MIN_CONFIDENCE = 0.6;

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

export function isSceneLabelSupported(): boolean {
  return Platform.OS === 'android' && isSceneLabelNativeAvailable();
}

export async function analyzeSceneLabels(imageUri: string): Promise<SceneLabel[]> {
  if (!isSceneLabelSupported() || !imageUri.trim()) {
    return [];
  }
  const result = await withTimeout(
    nativeLabelImage(imageUri, DEFAULT_MAX_LABELS, DEFAULT_MIN_CONFIDENCE),
    ANALYSIS_TIMEOUT_MS,
  );
  return result ?? [];
}

export function formatSceneMemo(labels: SceneLabel[]): string {
  if (labels.length === 0) {
    return '';
  }
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const label of labels) {
    const display = translateSceneLabel(label.text);
    const key = display.toLowerCase();
    if (!display || seen.has(key)) {
      continue;
    }
    seen.add(key);
    parts.push(display);
    if (parts.length >= 5) {
      break;
    }
  }
  return parts.join(', ');
}

/** On-device Image Labeling → memo keyword draft. Null on empty/timeout/unsupported. */
export async function suggestSceneMemo(imageUri: string): Promise<string | null> {
  const labels = await analyzeSceneLabels(imageUri);
  const memo = formatSceneMemo(labels);
  return memo || null;
}
