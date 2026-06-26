import { Platform } from 'react-native';

import { translateSceneLabel } from './sceneLabelKo';
import type { SceneLabel } from './sceneLabelService.types';
import { labelImageNative } from './voicestampMlkitNative';

export type { SceneLabel } from './sceneLabelService.types';

const ANALYSIS_TIMEOUT_MS = 8000;
const DEFAULT_MAX_LABELS = 5;
const DEFAULT_MIN_CONFIDENCE = 0.6;

export async function analyzeSceneLabels(imageUri: string): Promise<SceneLabel[]> {
  if (Platform.OS !== 'android' || !imageUri.trim()) {
    return [];
  }

  try {
    const result = await Promise.race([
      labelImageNative(imageUri, DEFAULT_MAX_LABELS, DEFAULT_MIN_CONFIDENCE),
      new Promise<SceneLabel[]>((resolve) => {
        setTimeout(() => resolve([]), ANALYSIS_TIMEOUT_MS);
      }),
    ]);
    return result;
  } catch {
    return [];
  }
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

export async function suggestSceneMemo(imageUri: string): Promise<string | null> {
  const labels = await analyzeSceneLabels(imageUri);
  const memo = formatSceneMemo(labels);
  return memo || null;
}
