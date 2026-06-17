import type { ViewStyle } from 'react-native';

import type { WatermarkStyle } from './settingsService';

export type WatermarkTheme = {
  barBackground: string;
  nativeBarColor: string;
  titleColor: string;
  memoColor: string;
  coordsColor: string;
};

export function getWatermarkTheme(style: WatermarkStyle): WatermarkTheme {
  if (style === 'solid_light') {
    return {
      barBackground: 'rgba(255, 255, 255, 0.55)',
      nativeBarColor: '#FFFFFF8C',
      titleColor: '#111827',
      memoColor: '#374151',
      coordsColor: '#6b7280',
    };
  }

  return {
    barBackground: 'rgba(0, 0, 0, 0.55)',
    nativeBarColor: '#0000008C',
    titleColor: '#ffffff',
    memoColor: '#f3f4f6',
    coordsColor: '#e5e7eb',
  };
}

export function watermarkBarStyle(style: WatermarkStyle, extra?: ViewStyle): ViewStyle {
  const theme = getWatermarkTheme(style);
  return {
    backgroundColor: theme.barBackground,
    ...extra,
  };
}

export function watermarkBarCss(style: WatermarkStyle): string {
  const theme = getWatermarkTheme(style);
  return `background: ${theme.barBackground}; color: ${theme.titleColor};`;
}

export function drawWatermarkBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  style: WatermarkStyle,
): void {
  const theme = getWatermarkTheme(style);
  ctx.fillStyle = theme.barBackground;
  ctx.fillRect(x, y, width, height);
}
