import { normalizeHttpUrl } from './qrUrlExtractService';
import { getOverlayHomeUrl, getOverlayShowHomeQr } from './settingsService';

/**
 * JPEG/PDF QR payload: stamp http(s) first, else settings home when shown.
 * Does not fetch or open the URL.
 */
export async function resolveComposeQrUrl(
  stampSourceUrl?: string | null,
): Promise<string | null> {
  const fromStamp = normalizeHttpUrl(stampSourceUrl ?? '');
  if (fromStamp) {
    return fromStamp;
  }
  const showHome = await getOverlayShowHomeQr();
  if (!showHome) {
    return null;
  }
  return normalizeHttpUrl(await getOverlayHomeUrl());
}
