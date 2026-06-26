import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

import type { SceneLabel } from './sceneLabelService.types';

type LabelImageResponse = {
  labels: SceneLabel[];
};

type VoicestampMlkitNative = {
  labelImage(
    localUri: string,
    maxLabels: number,
    minConfidence: number,
  ): Promise<LabelImageResponse>;
};

let nativeModule: VoicestampMlkitNative | null | undefined;

function getNativeModule(): VoicestampMlkitNative | null {
  if (Platform.OS !== 'android') {
    return null;
  }
  if (nativeModule === undefined) {
    try {
      nativeModule = requireNativeModule<VoicestampMlkitNative>('VoicestampMlkit');
    } catch {
      nativeModule = null;
    }
  }
  return nativeModule;
}

export async function labelImageNative(
  localUri: string,
  maxLabels = 5,
  minConfidence = 0.6,
): Promise<SceneLabel[]> {
  const mod = getNativeModule();
  if (!mod) {
    return [];
  }
  try {
    const result = await mod.labelImage(localUri, maxLabels, minConfidence);
    return result.labels ?? [];
  } catch {
    return [];
  }
}
