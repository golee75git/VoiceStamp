/**
 * QR PNG for caption overlay.
 * Uses MIT `qrcode` (create matrix only; no canvas). QR patents expired.
 * Only http(s) payloads; never opens or fetches the URL.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import QRCode from 'qrcode';

import { normalizeHttpUrl, SOURCE_URL_MAX_LEN } from './qrUrlExtractService';

const QR_MARGIN_MODULES = 2;
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u32be(n: number): number[] {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
}

function pngChunk(type: string, data: number[]): number[] {
  const typeBytes = [type.charCodeAt(0), type.charCodeAt(1), type.charCodeAt(2), type.charCodeAt(3)];
  const len = u32be(data.length);
  const body = [...typeBytes, ...data];
  const crc = u32be(crc32(Uint8Array.from(body)));
  return [...len, ...body, ...crc];
}

function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < data.length; i += 1) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

/** RFC 1950 zlib wrapper + stored (type 0) deflate blocks. */
function zlibStore(data: Uint8Array): Uint8Array {
  const chunks: number[] = [0x78, 0x01];
  let offset = 0;
  const max = 65535;
  while (offset < data.length) {
    const len = Math.min(max, data.length - offset);
    const isFinal = offset + len >= data.length ? 1 : 0;
    chunks.push(isFinal);
    chunks.push(len & 0xff, (len >> 8) & 0xff);
    const nlen = (~len) & 0xffff;
    chunks.push(nlen & 0xff, (nlen >> 8) & 0xff);
    for (let i = 0; i < len; i += 1) {
      chunks.push(data[offset + i]);
    }
    offset += len;
  }
  const adler = adler32(data);
  chunks.push(...u32be(adler));
  return Uint8Array.from(chunks);
}

function bytesToBase64(u8: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < u8.length; i += 1) {
    binary += String.fromCharCode(u8[i]);
  }
  return globalThis.btoa(binary);
}

/** Uncompressed RGB PNG (filter 0 each row). Suitable for small QR bitmaps. */
function rgbPngBase64(width: number, height: number, isBlack: (x: number, y: number) => boolean): string {
  const raw: number[] = [];
  for (let y = 0; y < height; y += 1) {
    raw.push(0);
    for (let x = 0; x < width; x += 1) {
      const v = isBlack(x, y) ? 0 : 255;
      raw.push(v, v, v);
    }
  }
  const ihdr = [...u32be(width), ...u32be(height), 8, 2, 0, 0, 0];
  const deflated = zlibStore(Uint8Array.from(raw));
  const bytes = [
    ...PNG_SIGNATURE,
    ...pngChunk('IHDR', ihdr),
    ...pngChunk('IDAT', [...deflated]),
    ...pngChunk('IEND', []),
  ];
  return bytesToBase64(Uint8Array.from(bytes));
}

function buildQrPngBase64(
  url: string,
  pixelSize: number,
): { base64: string; size: number } | null {
  let modules: { size: number; get: (row: number, col: number) => boolean };
  try {
    const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
    modules = qr.modules;
  } catch {
    return null;
  }

  const moduleCount = modules.size;
  const totalModules = moduleCount + QR_MARGIN_MODULES * 2;
  const scale = Math.max(1, Math.floor(pixelSize / totalModules));
  const dim = totalModules * scale;

  const base64 = rgbPngBase64(dim, dim, (x, y) => {
    const col = Math.floor(x / scale) - QR_MARGIN_MODULES;
    const row = Math.floor(y / scale) - QR_MARGIN_MODULES;
    if (row < 0 || col < 0 || row >= moduleCount || col >= moduleCount) {
      return false;
    }
    return modules.get(row, col);
  });
  return { base64, size: dim };
}

export function qrPixelSizeForPhoto(photoShortSide: number): number {
  const target = Math.round(photoShortSide * 0.16);
  return Math.max(64, Math.min(280, target));
}

/**
 * Write a white/black QR PNG. Native → cache file URI; web → data URI.
 * Returns null if URL invalid. `size` is the actual square pixel edge.
 */
export async function renderSourceUrlQrPngUri(
  rawUrl: string,
  pixelSize: number = 192,
): Promise<{ uri: string; size: number } | null> {
  const url = normalizeHttpUrl(rawUrl);
  if (!url || url.length > SOURCE_URL_MAX_LEN) {
    return null;
  }

  const built = buildQrPngBase64(url, pixelSize);
  if (!built) {
    return null;
  }
  const { base64, size } = built;

  if (Platform.OS === 'web') {
    return { uri: `data:image/png;base64,${base64}`, size };
  }

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    return null;
  }

  const dest = `${cacheDir}qr-source-${Date.now()}-${size}.png`;
  await FileSystem.writeAsStringAsync(dest, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const uri = dest.startsWith('file://') ? dest : `file://${dest}`;
  return { uri, size };
}
