const DEFAULT_API_URL = 'https://voicestamp-gilt.vercel.app/api/project';

export function getProjectApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_PROJECT_API_URL?.trim();
  return fromEnv || DEFAULT_API_URL;
}

export type ProjectCreateResult = {
  projectId: string;
  name: string;
  uploadCode: string;
  expiresAt: number;
  ttlDays: number;
  qrPayload: string;
};

export type ManifestStamp = {
  stampId: string;
  title?: string;
  uploadedAt?: number;
  uploadedByDeviceId?: string | null;
  uploadedByMark?: string | null;
};

export type ManifestResult = {
  projectId: string;
  name: string;
  expiresAt: number;
  closedAt: number | null;
  stamps: ManifestStamp[];
  lastUploadAt: number | null;
};

async function postAction<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(getProjectApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    const err = new Error(data.error || `http_${res.status}`);
    (err as Error & { code?: string }).code = data.error || `http_${res.status}`;
    throw err;
  }
  return data;
}

export async function apiCreateProject(input: {
  name: string;
  ttlDays: number;
  collectorPin: string;
}): Promise<ProjectCreateResult> {
  return postAction<ProjectCreateResult>({ action: 'create', ...input });
}

export async function apiLookupProject(projectId: string): Promise<{
  projectId: string;
  name: string;
  expiresAt: number;
  ttlDays: number;
}> {
  return postAction({ action: 'lookup', projectId });
}

export async function apiUploadStamp(input: {
  projectId: string;
  uploadCode: string;
  stampId: string;
  imageBase64: string;
  meta: Record<string, unknown>;
}): Promise<{ ok: boolean }> {
  return postAction({ action: 'upload', ...input });
}

export async function apiManifest(input: {
  projectId: string;
  collectorPin: string;
}): Promise<ManifestResult> {
  return postAction({ action: 'manifest', ...input });
}

export async function apiDownloadStamp(input: {
  projectId: string;
  collectorPin: string;
  stampId: string;
}): Promise<{ meta: Record<string, unknown>; imageBase64: string }> {
  return postAction({ action: 'download', ...input });
}

export async function apiImportAck(input: {
  projectId: string;
  collectorPin: string;
  stampId: string;
}): Promise<{ ok: boolean }> {
  return postAction({ action: 'importAck', ...input });
}

export async function apiCloseProject(input: {
  projectId: string;
  collectorPin: string;
}): Promise<{ ok: boolean }> {
  return postAction({ action: 'close', ...input });
}

export async function apiRotateUploadCode(input: {
  projectId: string;
  collectorPin: string;
}): Promise<{ uploadCode: string; qrPayload: string }> {
  return postAction({ action: 'rotateUploadCode', ...input });
}

export function mapProjectApiError(e: unknown): string {
  const code = e instanceof Error ? (e as Error & { code?: string }).code || e.message : '';
  switch (code) {
    case 'ncp_not_configured':
      return '일시 저장소가 아직 설정되지 않았습니다. 관리자에게 문의하세요.';
    case 'bad_upload_code':
      return '참여 코드가 올바르지 않습니다. QR을 다시 받아 주세요.';
    case 'bad_collector_pin':
      return '취합 PIN이 올바르지 않습니다.';
    case 'project_expired':
      return '이 사업은 종료되었습니다. 연결을 끊어 주세요.';
    case 'not_found':
      return '사업을 찾을 수 없습니다.';
    default:
      return e instanceof Error ? e.message : '요청에 실패했습니다.';
  }
}
