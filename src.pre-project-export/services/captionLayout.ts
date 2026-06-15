import type { TextAlign } from './settingsService';

export const CAPTION_REFERENCE_PHOTO_WIDTH = 1032;

export type CaptionLayout = {
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
  titleY: number;
  memoY: number | null;
  coordsY: number | null;
  titleSize: number;
  memoSize: number;
  coordsSize: number;
  titleLineHeight: number;
  memoLineHeight: number;
  coordsLineHeight: number;
  titleText: string;
  memoText: string;
  coordsText: string;
  titleAlign: TextAlign;
  memoAlign: TextAlign;
  coordsAlign: TextAlign;
};

function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code <= 0x007f) {
      width += fontSize * 0.55;
      continue;
    }
    width += fontSize;
  }
  return width;
}

export function wrapTextLines(text: string, maxWidth: number, fontSize: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    let current = '';
    for (const char of paragraph) {
      const next = current + char;
      if (estimateTextWidth(next, fontSize) > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    }
    if (current) {
      lines.push(current);
    }
  }

  return lines.length > 0 ? lines : [''];
}

export function captionTextX(align: TextAlign, padding: number, canvasWidth: number): number {
  if (align === 'center') {
    return Math.round(canvasWidth / 2);
  }
  if (align === 'right') {
    return canvasWidth - padding;
  }
  return padding;
}

export function buildCaptionLayout(
  photoWidth: number,
  photoHeight: number,
  title: string,
  memo: string,
  titleAlign: TextAlign,
  memoAlign: TextAlign,
  coords: string | null,
): CaptionLayout {
  const scale = photoWidth / CAPTION_REFERENCE_PHOTO_WIDTH;
  const padding = Math.max(12, Math.round(24 * scale));
  const titleSize = Math.max(18, Math.round(36 * scale));
  const memoSize = Math.max(16, Math.round(28 * scale));
  const coordsSize = Math.max(14, Math.round(24 * scale));
  const titleLineHeight = Math.max(24, Math.round(44 * scale));
  const memoLineHeight = Math.max(22, Math.round(36 * scale));
  const coordsLineHeight = Math.max(20, Math.round(32 * scale));
  const contentWidth = photoWidth;
  const canvasWidth = contentWidth + padding * 2;
  const coordsAlign = memoAlign;

  const titleLines = wrapTextLines(title, contentWidth, titleSize);
  const memoLines = memo ? wrapTextLines(memo, contentWidth, memoSize) : [];
  const coordsLines = coords ? wrapTextLines(coords, contentWidth, coordsSize) : [];

  const titleBlockHeight = titleLines.length * titleLineHeight;
  const memoBlockHeight = memoLines.length > 0 ? Math.round(12 * scale) + memoLines.length * memoLineHeight : 0;
  const coordsBlockHeight =
    coordsLines.length > 0 ? Math.round(8 * scale) + coordsLines.length * coordsLineHeight : 0;
  const canvasHeight =
    padding +
    photoHeight +
    Math.round(16 * scale) +
    titleBlockHeight +
    memoBlockHeight +
    coordsBlockHeight +
    padding;

  const titleY = padding + photoHeight + Math.round(40 * scale);
  const memoY =
    memoLines.length > 0 ? titleY + titleBlockHeight + Math.round(12 * scale) : null;
  const coordsY =
    coordsLines.length > 0
      ? (memoY !== null
          ? memoY + memoLines.length * memoLineHeight
          : titleY + titleBlockHeight) + Math.round(8 * scale)
      : null;

  return {
    canvasWidth,
    canvasHeight,
    padding,
    titleY,
    memoY,
    coordsY,
    titleSize,
    memoSize,
    coordsSize,
    titleLineHeight,
    memoLineHeight,
    coordsLineHeight,
    titleText: titleLines.join('\n'),
    memoText: memoLines.join('\n'),
    coordsText: coordsLines.join('\n'),
    titleAlign,
    memoAlign,
    coordsAlign,
  };
}
