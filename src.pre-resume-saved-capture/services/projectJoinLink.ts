/** Parse / stash VoiceStamp project join links (https or voicestamp://). */

export type ProjectJoinCodes = {
  projectId: string;
  uploadCode: string;
  /** Built-in save-template id (`t=`). Optional. */
  templateId?: string | null;
  /** Server invite snapshot id (`i=`). Optional. */
  inviteId?: string | null;
};

const HTTPS_HOST = 'voicestamp-gilt.vercel.app';

function sanitizeQueryToken(raw: string | null | undefined, max = 64): string | null {
  const s = String(raw || '')
    .trim()
    .slice(0, max);
  return s || null;
}

export function buildProjectJoinHttpsUrl(
  projectId: string,
  uploadCode: string,
  opts?: { templateId?: string | null; inviteId?: string | null },
): string {
  const sp = new URLSearchParams();
  sp.set('p', projectId);
  sp.set('c', uploadCode);
  const t = sanitizeQueryToken(opts?.templateId);
  const i = sanitizeQueryToken(opts?.inviteId, 32);
  if (t) sp.set('t', t);
  if (i) sp.set('i', i);
  return `https://${HTTPS_HOST}/join?${sp.toString()}`;
}

export function buildProjectJoinAppUrl(
  projectId: string,
  uploadCode: string,
  opts?: { templateId?: string | null; inviteId?: string | null },
): string {
  const sp = new URLSearchParams();
  sp.set('p', projectId);
  sp.set('c', uploadCode);
  const t = sanitizeQueryToken(opts?.templateId);
  const i = sanitizeQueryToken(opts?.inviteId, 32);
  if (t) sp.set('t', t);
  if (i) sp.set('i', i);
  return `voicestamp://join?${sp.toString()}`;
}

function codesFromParams(sp: URLSearchParams): ProjectJoinCodes | null {
  const projectId = sp.get('p') || '';
  const uploadCode = sp.get('c') || '';
  if (!projectId || !uploadCode) return null;
  return {
    projectId,
    uploadCode,
    templateId: sanitizeQueryToken(sp.get('t')),
    inviteId: sanitizeQueryToken(sp.get('i'), 32),
  };
}

export function parseProjectJoinLink(raw: string): ProjectJoinCodes | null {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return null;

  try {
    if (/^voicestamp:\/\//i.test(trimmed)) {
      const q = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : '';
      const codes = codesFromParams(new URLSearchParams(q));
      if (codes) return codes;
    } else if (trimmed.includes('://') || trimmed.startsWith('/join')) {
      const url = new URL(trimmed, `https://${HTTPS_HOST}/`);
      const pathOk =
        url.pathname === '/join' ||
        url.pathname.endsWith('/join') ||
        url.pathname.endsWith('/join.html');
      const hostOk = !url.host || url.host.includes('voicestamp') || url.host === HTTPS_HOST;
      if (pathOk && hostOk) {
        const codes = codesFromParams(url.searchParams);
        if (codes) return codes;
      }
    }
  } catch {
    // fall through
  }

  if (trimmed.includes('/join?') || trimmed.includes('join?p=')) {
    try {
      const q = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : '';
      const codes = codesFromParams(new URLSearchParams(q));
      if (codes) return codes;
    } catch {
      // ignore
    }
  }

  const parts = trimmed.split(/[\s,|/]+/).filter(Boolean);
  if (parts.length >= 2 && parts[0].startsWith('VS-')) {
    return {
      projectId: parts[0],
      uploadCode: parts[1],
      templateId: sanitizeQueryToken(parts[2]),
      inviteId: null,
    };
  }
  return null;
}

let pendingJoinUrl: string | null = null;

export function stashProjectJoinUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (!parseProjectJoinLink(url)) return false;
  pendingJoinUrl = url;
  return true;
}

export function takePendingJoinUrl(): string | null {
  const u = pendingJoinUrl;
  pendingJoinUrl = null;
  return u;
}
