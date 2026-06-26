import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

export type SceneLabelResult = {
  text: string;
  confidence: number;
};

type LabelImageResponse = {
  labels: SceneLabelResult[];
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

export async function labelImage(
  localUri: string,
  maxLabels = 5,
  minConfidence = 0.6,
): Promise<LabelImageResponse | null> {
  const mod = getNativeModule();
  if (!mod) {
    return null;
  }
  return mod.labelImage(localUri, maxLabels, minConfidence);
}
