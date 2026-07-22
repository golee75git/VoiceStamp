import type { TextAlign } from './settingsService';

export const CAPTION_REFERENCE_PHOTO_WIDTH = 1032;

export type CaptionLayout = {
  canvasWidth: number;
  canvasHeight: number;
  padding: number;
  orgY: number | null;
  titleY: number;
  placeY: number | null;
  extra1Y: number | null;
  extra2Y: number | null;
  memoY: number | null;
  coordsY: number | null;
  phraseY: number | null;
  orgSize: number;
  titleSize: number;
  placeSize: number;
  memoSize: number;
  coordsSize: number;
  phraseSize: number;
  orgLineHeight: number;
  titleLineHeight: number;
  placeLineHeight: number;
  memoLineHeight: number;
  coordsLineHeight: number;
  phraseLineHeight: number;
  orgText: string;
  titleText: string;
  placeText: string;
  extra1Text: string;
  extra2Text: string;
  memoText: string;
  coordsText: string;
  phraseText: string;
  titleAlign: TextAlign;
  memoAlign: TextAlign;
  coordsAlign: TextAlign;
  phraseAlign: TextAlign;
  placeAlign: TextAlign;
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
  orgName: string | null = null,
  footerPhrase: string | null = null,
  place: string | null = null,
  extra1: string | null = null,
  extra2: string | null = null,
  textSizeScale = 1,
): CaptionLayout {
  const scale = (photoWidth / CAPTION_REFERENCE_PHOTO_WIDTH) * textSizeScale;
  const padding = Math.max(12, Math.round(24 * (photoWidth / CAPTION_REFERENCE_PHOTO_WIDTH)));
  const orgSize = Math.max(16, Math.round(28 * scale));
  const titleSize = Math.max(18, Math.round(36 * scale));
  const placeSize = Math.max(15, Math.round(26 * scale));
  const memoSize = Math.max(16, Math.round(28 * scale));
  const coordsSize = Math.max(14, Math.round(24 * scale));
  const phraseSize = Math.max(13, Math.round(22 * scale));
  const layoutScale = photoWidth / CAPTION_REFERENCE_PHOTO_WIDTH;
  const orgLineHeight = Math.max(22, Math.round(36 * scale));
  const titleLineHeight = Math.max(24, Math.round(44 * scale));
  const placeLineHeight = Math.max(20, Math.round(32 * scale));
  const memoLineHeight = Math.max(22, Math.round(36 * scale));
  const coordsLineHeight = Math.max(20, Math.round(32 * scale));
  const phraseLineHeight = Math.max(18, Math.round(28 * scale));
  const contentWidth = photoWidth;
  const canvasWidth = contentWidth + padding * 2;
  const coordsAlign = memoAlign;
  const phraseAlign = memoAlign;
  const placeAlign = titleAlign;

  const orgLines = orgName ? wrapTextLines(orgName, contentWidth, orgSize) : [];
  const titleLines = wrapTextLines(title, contentWidth, titleSize);
  const placeLines = place ? wrapTextLines(place, contentWidth, placeSize) : [];
  const extra1Lines = extra1 ? wrapTextLines(extra1, contentWidth, placeSize) : [];
  const extra2Lines = extra2 ? wrapTextLines(extra2, contentWidth, placeSize) : [];
  const memoLines = memo ? wrapTextLines(memo, contentWidth, memoSize) : [];
  const coordsLines = coords ? wrapTextLines(coords, contentWidth, coordsSize) : [];
  const phraseLines = footerPhrase ? wrapTextLines(footerPhrase, contentWidth, phraseSize) : [];

  const orgBlockHeight = orgLines.length > 0 ? orgLines.length * orgLineHeight + Math.round(8 * layoutScale) : 0;
  const titleBlockHeight = titleLines.length * titleLineHeight;
  const placeBlockHeight =
    placeLines.length > 0 ? Math.round(8 * layoutScale) + placeLines.length * placeLineHeight : 0;
  const extra1BlockHeight =
    extra1Lines.length > 0 ? Math.round(8 * layoutScale) + extra1Lines.length * placeLineHeight : 0;
  const extra2BlockHeight =
    extra2Lines.length > 0 ? Math.round(8 * layoutScale) + extra2Lines.length * placeLineHeight : 0;
  const memoBlockHeight =
    memoLines.length > 0 ? Math.round(12 * layoutScale) + memoLines.length * memoLineHeight : 0;
  const coordsBlockHeight =
    coordsLines.length > 0 ? Math.round(8 * layoutScale) + coordsLines.length * coordsLineHeight : 0;
  const phraseBlockHeight =
    phraseLines.length > 0 ? Math.round(8 * layoutScale) + phraseLines.length * phraseLineHeight : 0;

  const canvasHeight =
    padding +
    photoHeight +
    Math.round(16 * layoutScale) +
    orgBlockHeight +
    titleBlockHeight +
    placeBlockHeight +
    extra1BlockHeight +
    extra2BlockHeight +
    memoBlockHeight +
    coordsBlockHeight +
    phraseBlockHeight +
    padding;

  let cursorY = padding + photoHeight + Math.round(40 * layoutScale);
  const orgY = orgLines.length > 0 ? cursorY : null;
  if (orgY !== null) {
    cursorY += orgBlockHeight;
  }

  const titleY = cursorY;
  cursorY += titleBlockHeight;

  const placeY = placeLines.length > 0 ? cursorY + Math.round(8 * layoutScale) : null;
  if (placeY !== null) {
    cursorY += placeBlockHeight;
  }

  const extra1Y = extra1Lines.length > 0 ? cursorY + Math.round(8 * layoutScale) : null;
  if (extra1Y !== null) {
    cursorY += extra1BlockHeight;
  }

  const extra2Y = extra2Lines.length > 0 ? cursorY + Math.round(8 * layoutScale) : null;
  if (extra2Y !== null) {
    cursorY += extra2BlockHeight;
  }

  const memoY = memoLines.length > 0 ? cursorY + Math.round(12 * layoutScale) : null;
  if (memoY !== null) {
    cursorY += memoBlockHeight;
  }

  const coordsY = coordsLines.length > 0 ? cursorY + Math.round(8 * layoutScale) : null;
  if (coordsY !== null) {
    cursorY += coordsBlockHeight;
  }

  const phraseY = phraseLines.length > 0 ? cursorY + Math.round(8 * layoutScale) : null;

  return {
    canvasWidth,
    canvasHeight,
    padding,
    orgY,
    titleY,
    placeY,
    extra1Y,
    extra2Y,
    memoY,
    coordsY,
    phraseY,
    orgSize,
    titleSize,
    placeSize,
    memoSize,
    coordsSize,
    phraseSize,
    orgLineHeight,
    titleLineHeight,
    placeLineHeight,
    memoLineHeight,
    coordsLineHeight,
    phraseLineHeight,
    orgText: orgLines.join('\n'),
    titleText: titleLines.join('\n'),
    placeText: placeLines.join('\n'),
    extra1Text: extra1Lines.join('\n'),
    extra2Text: extra2Lines.join('\n'),
    memoText: memoLines.join('\n'),
    coordsText: coordsLines.join('\n'),
    phraseText: phraseLines.join('\n'),
    titleAlign,
    memoAlign,
    coordsAlign,
    phraseAlign,
    placeAlign,
  };
}
