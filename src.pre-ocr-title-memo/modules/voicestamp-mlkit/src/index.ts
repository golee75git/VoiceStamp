import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

export type NativePrivacyRegion = {
  id: string;
  type: 'face' | 'text' | string;
  left: number;
  top: number;
  width: number;
  height: number;
  text?: string | null;
  enabled?: boolean;
};

export type NativeDetectResult = {
  width: number;
  height: number;
  regions: NativePrivacyRegion[];
};

type VoicestampMlkitNative = {
  detectPrivacyRegions(localUri: string): Promise<NativeDetectResult>;
  applyBlurRegions(
    localUri: string,
    regionsJson: string,
    strength: string,
  ): Promise<string>;
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

export async function nativeDetectPrivacyRegions(
  localUri: string,
): Promise<NativeDetectResult | null> {
  const mod = getNativeModule();
  if (!mod) {
    return null;
  }
  return mod.detectPrivacyRegions(localUri);
}

export async function nativeApplyBlurRegions(
  localUri: string,
  regionsJson: string,
  strength: string,
): Promise<string | null> {
  const mod = getNativeModule();
  if (!mod) {
    return null;
  }
  return mod.applyBlurRegions(localUri, regionsJson, strength);
}

export function isPrivacyBlurNativeAvailable(): boolean {
  return getNativeModule() != null;
}
