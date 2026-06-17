import type { ViewStyle } from 'react-native';

import type { WatermarkStyle } from './settingsService';

export type WatermarkTheme = {
  barBackground: string;
  nativeBarColor: string;
  titleColor: string;
  memoColor: string;
  coordsColor: string;
};

const LIGHT_TEXT = {
  titleColor: '#ffffff',
  memoColor: '#f3f4f6',
  coordsColor: '#e5e7eb',
};

const DARK_TEXT = {
  titleColor: '#111827',
  memoColor: '#374151',
  coordsColor: '#6b7280',
};

function rgbaBar(
  r: number,
  g: number,
  b: number,
): Pick<WatermarkTheme, 'barBackground' | 'nativeBarColor'> {
  const hex =
    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  return {
    barBackground: `rgba(${r}, ${g}, ${b}, 0.55)`,
    nativeBarColor: `${hex}8C`,
  };
}

const WATERMARK_THEMES: Record<WatermarkStyle, WatermarkTheme> = {
  solid_dark: { ...rgbaBar(0, 0, 0), ...LIGHT_TEXT },
  solid_light: { ...rgbaBar(255, 255, 255), ...DARK_TEXT },
  slate: { ...rgbaBar(71, 85, 105), ...LIGHT_TEXT },
  blue: { ...rgbaBar(37, 99, 235), ...LIGHT_TEXT },
  indigo: { ...rgbaBar(79, 70, 229), ...LIGHT_TEXT },
  green: { ...rgbaBar(22, 163, 74), ...LIGHT_TEXT },
  teal: { ...rgbaBar(13, 148, 136), ...LIGHT_TEXT },
  amber: { ...rgbaBar(217, 119, 6), ...LIGHT_TEXT },
  red: { ...rgbaBar(220, 38, 38), ...LIGHT_TEXT },
  rose: { ...rgbaBar(225, 29, 72), ...LIGHT_TEXT },
};

/** Solid chip color shown in settings palette (full opacity). */
export const WATERMARK_CHIP_COLORS: Record<WatermarkStyle, string> = {
  solid_dark: '#1f2937',
  solid_light: '#f3f4f6',
  slate: '#475569',
  blue: '#2563eb',
  indigo: '#4f46e5',
  green: '#16a34a',
  teal: '#0d9488',
  amber: '#d97706',
  red: '#dc2626',
  rose: '#e11d48',
};

export function getWatermarkTheme(style: WatermarkStyle): WatermarkTheme {
  return WATERMARK_THEMES[style] ?? WATERMARK_THEMES.solid_dark;
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
