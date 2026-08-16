export type OverlayTextFields = {
  orgName: string;
  footerPhrase: string;
  showOrgName: boolean;
  showFooterPhrase: boolean;
};

export const DEFAULT_OVERLAY_ORG_NAME = '';
export const DEFAULT_OVERLAY_FOOTER_PHRASE = '';
export const DEFAULT_OVERLAY_SHOW_ORG_NAME = true;
export const DEFAULT_OVERLAY_SHOW_FOOTER_PHRASE = true;
export const DEFAULT_OVERLAY_SHOW_MARK = true;

export const OVERLAY_ORG_MAX_LENGTH = 80;
export const OVERLAY_PHRASE_MAX_LENGTH = 120;

export function sanitizeOverlayText(text: string, maxLength: number): string {
  return text.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

export function sanitizeOverlayShowFlag(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return value !== 'false';
}

export function resolveOverlayOrgName(options: OverlayTextFields): string | null {
  if (!options.showOrgName) {
    return null;
  }
  const trimmed = sanitizeOverlayText(options.orgName, OVERLAY_ORG_MAX_LENGTH);
  return trimmed || null;
}

export function resolveOverlayFooterPhrase(options: OverlayTextFields): string | null {
  if (!options.showFooterPhrase) {
    return null;
  }
  const trimmed = sanitizeOverlayText(options.footerPhrase, OVERLAY_PHRASE_MAX_LENGTH);
  return trimmed || null;
}

export function overlayPhraseFontSize(baseFontSize: number): number {
  return Math.max(12, Math.round(baseFontSize * 0.82));
}
