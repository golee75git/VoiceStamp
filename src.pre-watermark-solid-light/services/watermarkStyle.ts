import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import type { ViewStyle } from 'react-native';

import type { WatermarkStyle } from './settingsService';

export const WATERMARK_REFERENCE_WIDTH = 1032;

const STRIPE_TILE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIElEQVR4nGPYKSPzDBkzMDD0YMM41Y0aMGrAqAHDxQAAv8IxkL/NG8oAAAAASUVORK5CYII=';
const SOLID_DARK_TILE_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGDoAQAAkQCNy0ftVwAAAABJRU5ErkJggg==';

export type WatermarkTheme = {
  barBackground: string;
  nativeBarColor: string;
  titleColor: string;
  memoColor: string;
  coordsColor: string;
  pattern: 'solid' | 'red_stripes';
  stripeColor: string;
};

export function getWatermarkTheme(style: WatermarkStyle): WatermarkTheme {
  if (style === 'red_stripes') {
    return {
      barBackground: 'rgba(0, 0, 0, 0.55)',
      nativeBarColor: '#0000008C',
      titleColor: '#ffffff',
      memoColor: '#f3f4f6',
      coordsColor: '#e5e7eb',
      pattern: 'red_stripes',
      stripeColor: '#dc2626',
    };
  }

  return {
    barBackground: 'rgba(0, 0, 0, 0.55)',
    nativeBarColor: '#0000008C',
    titleColor: '#ffffff',
    memoColor: '#f3f4f6',
    coordsColor: '#e5e7eb',
    pattern: 'solid',
    stripeColor: '#dc2626',
  };
}

function estimateLineCount(text: string, charsPerLine: number): number {
  if (!text) {
    return 0;
  }

  return text.split('\n').reduce((sum, paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      return sum + 1;
    }
    return sum + Math.max(1, Math.ceil(trimmed.length / charsPerLine));
  }, 0);
}

export function computeWatermarkBarHeight(
  imageWidth: number,
  title: string,
  memo: string,
  coords: string,
): number {
  const scale = imageWidth / WATERMARK_REFERENCE_WIDTH;
  const barPaddingX = Math.round(20 * scale);
  const barPaddingY = Math.round(16 * scale);
  const textWidth = Math.max(1, imageWidth - barPaddingX * 2);
  const charsPerLine = Math.max(8, Math.floor(textWidth / (16 * scale)));

  const titleLines = Math.max(1, estimateLineCount(title, charsPerLine));
  const memoLines = estimateLineCount(memo, charsPerLine);
  const coordsLines = estimateLineCount(coords, charsPerLine);

  return (
    barPaddingY +
    titleLines * Math.round(38 * scale) +
    (memoLines > 0 ? Math.round(8 * scale) + memoLines * Math.round(32 * scale) : 0) +
    (coordsLines > 0 ? Math.round(6 * scale) + coordsLines * Math.round(28 * scale) : 0) +
    barPaddingY
  );
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
  if (theme.pattern === 'red_stripes') {
    return `background: rgba(0, 0, 0, 0.55); background-image: repeating-linear-gradient(90deg, rgba(220, 38, 38, 0.92) 0 4px, transparent 4px 10px);`;
  }
  return 'background: rgba(0, 0, 0, 0.55);';
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

  if (theme.pattern !== 'red_stripes') {
    return;
  }

  ctx.fillStyle = 'rgba(220, 38, 38, 0.92)';
  for (let offset = 0; offset < width; offset += 10) {
    ctx.fillRect(x + offset, y, 4, height);
  }
}

export async function createNativeWatermarkBarUri(
  width: number,
  height: number,
  style: WatermarkStyle,
): Promise<string> {
  const base64 = style === 'red_stripes' ? STRIPE_TILE_BASE64 : SOLID_DARK_TILE_BASE64;
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error('워터마크 바 이미지를 만들 수 없습니다.');
  }

  const tempUri = `${cacheDir}wm-tile-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(tempUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const resized = await manipulateAsync(tempUri, [{ resize: { width, height } }], {
    compress: 1,
    format: SaveFormat.PNG,
  });

  return resized.uri;
}
