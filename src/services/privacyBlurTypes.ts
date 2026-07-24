export type PrivacyRegionType = 'face' | 'text';

export type BlurStrength = 'light' | 'medium' | 'strong';

export type PrivacyRegion = {
  id: string;
  type: PrivacyRegionType;
  left: number;
  top: number;
  width: number;
  height: number;
  text?: string;
  enabled: boolean;
};

export type PrivacyDetectResult = {
  width: number;
  height: number;
  regions: PrivacyRegion[];
  /** Upright file used for detect (EXIF orientation baked). Use for preview + apply. */
  imageUri: string;
};

export const BLUR_STRENGTH_OPTIONS: BlurStrength[] = ['light', 'medium', 'strong'];

export function blurStrengthLabel(strength: BlurStrength): string {
  switch (strength) {
    case 'light':
      return '약';
    case 'strong':
      return '강';
    default:
      return '중';
  }
}
