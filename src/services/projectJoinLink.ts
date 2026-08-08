/** Parse / stash VoiceStamp project join links (https or voicestamp://). */

export type ProjectJoinCodes = {
  projectId: string;
  uploadCode: string;
};

const HTTPS_HOST = 'voicestamp-gilt.vercel.app';

export function buildProjectJoinHttpsUrl(projectId: string, uploadCode: string): string {
  return `https://${HTTPS_HOST}/join?p=${encodeURIComponent(projectId)}&c=${encodeURIComponent(uploadCode)}`;
}

export function buildProjectJoinAppUrl(projectId: string, uploadCode: string): string {
  return `voicestamp://join?p=${encodeURIComponent(projectId)}&c=${encodeURIComponent(uploadCode)}`;
}

export function parseProjectJoinLink(raw: string): ProjectJoinCodes | null {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return null;

  try {
    if (/^voicestamp:\/\//i.test(trimmed)) {
      const q = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : '';
      const sp = new URLSearchParams(q);
      const projectId = sp.get('p') || '';
      const uploadCode = sp.get('c') || '';
      if (projectId && uploadCode) return { projectId, uploadCode };
    } else if (trimmed.includes('://') || trimmed.startsWith('/join')) {
      const url = new URL(trimmed, `https://${HTTPS_HOST}/`);
      const projectId = url.searchParams.get('p') || '';
      const uploadCode = url.searchParams.get('c') || '';
      const pathOk = url.pathname === '/join' || url.pathname.endsWith('/join') || url.pathname.endsWith('/join.html');
      const hostOk = !url.host || url.host.includes('voicestamp') || url.host === HTTPS_HOST;
      if (projectId && uploadCode && pathOk && hostOk) {
        return { projectId, uploadCode };
      }
    }
  } catch {
    // fall through
  }

  if (trimmed.includes('/join?') || trimmed.includes('join?p=')) {
    try {
      const q = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : '';
      const sp = new URLSearchParams(q);
      const projectId = sp.get('p') || '';
      const uploadCode = sp.get('c') || '';
      if (projectId && uploadCode) return { projectId, uploadCode };
    } catch {
      // ignore
    }
  }

  const parts = trimmed.split(/[\s,|/]+/).filter(Boolean);
  if (parts.length >= 2 && parts[0].startsWith('VS-')) {
    return { projectId: parts[0], uploadCode: parts[1] };
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
