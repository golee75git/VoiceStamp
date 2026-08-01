/**
 * User-initiated http(s) reachability probe for the save-screen QR URL field.
 * Own VoiceStamp logic (normalize + host guards + timed fetch). No new deps.
 * Does not store response bodies. Credentials omitted. Private/local hosts blocked.
 */
import { normalizeHttpUrl } from './qrUrlExtractService';

export type QrUrlConnectCheckResult = {
  ok: boolean;
  status?: number;
  message: string;
};

const CHECK_TIMEOUT_MS = 8_000;

/** Block loopback / link-local / RFC1918 / CGNAT / ULA — SSRF-style probes. */
export function isBlockedConnectHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!h || h === 'localhost' || h.endsWith('.localhost') || h === '0.0.0.0') {
    return true;
  }
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    const c = Number(v4[3]);
    const d = Number(v4[4]);
    if ([a, b, c, d].some((n) => n > 255)) {
      return true;
    }
    if (a === 0 || a === 10 || a === 127) {
      return true;
    }
    if (a === 169 && b === 254) {
      return true;
    }
    if (a === 172 && b >= 16 && b <= 31) {
      return true;
    }
    if (a === 192 && b === 168) {
      return true;
    }
    if (a === 100 && b >= 64 && b <= 127) {
      return true;
    }
    return false;
  }
  if (h === '::1' || h === '::') {
    return true;
  }
  if (h.startsWith('fe80:') || h.startsWith('fc') || h.startsWith('fd')) {
    return true;
  }
  return false;
}

function hostFromHref(href: string): string | null {
  try {
    return new URL(href).hostname;
  } catch {
    return null;
  }
}

/**
 * Probe whether the typed QR URL answers over the network.
 * Success = any meaningful HTTP response (incl. 4xx = server reached).
 * Failure = invalid URL, blocked host, timeout, or network error.
 */
export async function checkQrUrlConnection(raw: string): Promise<QrUrlConnectCheckResult> {
  const url = normalizeHttpUrl(raw);
  if (!url) {
    return { ok: false, message: 'http:// 또는 https:// URL만 확인할 수 있습니다.' };
  }

  const host = hostFromHref(url);
  if (!host || isBlockedConnectHost(host)) {
    return { ok: false, message: '기기·내부망 주소는 연결 확인할 수 없습니다.' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { Accept: '*/*' },
      credentials: 'omit',
    });

    const finalHref = typeof res.url === 'string' && res.url.trim() ? res.url : url;
    const finalHost = hostFromHref(finalHref);
    if (finalHost && isBlockedConnectHost(finalHost)) {
      return { ok: false, message: '내부망으로 연결이 바뀌어 확인할 수 없습니다.' };
    }

    const status = res.status;
    if (status >= 200 && status < 400) {
      return { ok: true, status, message: `연결됨 (HTTP ${status})` };
    }
    if (status >= 400 && status < 500) {
      return {
        ok: true,
        status,
        message: `서버 응답 있음 (HTTP ${status}). 주소·권한을 확인하세요.`,
      };
    }
    if (status >= 500) {
      return { ok: false, status, message: `서버 오류 (HTTP ${status})` };
    }
    return { ok: false, message: '응답이 없습니다.' };
  } catch (err) {
    const aborted =
      (err instanceof Error && (err.name === 'AbortError' || /aborted/i.test(err.message))) ||
      (typeof err === 'object' &&
        err !== null &&
        'name' in err &&
        String((err as { name: unknown }).name) === 'AbortError');
    return {
      ok: false,
      message: aborted
        ? '시간 초과 — 주소를 다시 확인하세요.'
        : '접속할 수 없습니다. 네트워크·주소를 확인하세요.',
    };
  } finally {
    clearTimeout(timer);
  }
}
