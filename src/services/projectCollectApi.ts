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
  templateId?: string | null;
};

export type InviteFieldTemplateDto = {
  sourceId: string;
  name: string;
  labels: {
    titleFieldLabel: string;
    placeFieldLabel: string;
    memoFieldLabel: string;
    extra1FieldLabel: string;
    extra2FieldLabel: string;
    extra3FieldLabel: string;
  };
  placeholders: {
    title: string;
    place: string;
    memo: string;
    extra1: string;
    extra2: string;
    extra3: string;
  };
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

export async function apiLookupProject(
  projectId: string,
  opts?: { inviteId?: string | null },
): Promise<{
  projectId: string;
  name: string;
  expiresAt: number;
  ttlDays: number;
  inviteId?: string | null;
  fieldTemplate?: InviteFieldTemplateDto | null;
}> {
  return postAction({
    action: 'lookup',
    projectId,
    inviteId: opts?.inviteId || undefined,
  });
}

export async function apiSetInviteTemplate(input: {
  projectId: string;
  collectorPin: string;
  template: InviteFieldTemplateDto;
}): Promise<{ inviteId: string; template: InviteFieldTemplateDto }> {
  return postAction({ action: 'setInviteTemplate', ...input });
}

export async function apiPrepareUpload(input: {
  projectId: string;
  uploadCode: string;
  stampId: string;
  meta: Record<string, unknown>;
}): Promise<{ stampId: string; putUrl: string; contentType: string; expiresIn: number }> {
  return postAction({ action: 'prepareUpload', ...input });
}

export async function apiCompleteUpload(input: {
  projectId: string;
  uploadCode: string;
  stampId: string;
}): Promise<{ ok: boolean; stampId: string }> {
  return postAction({ action: 'completeUpload', ...input });
}

export async function apiManifest(input: {
  projectId: string;
  collectorPin: string;
}): Promise<ManifestResult> {
  return postAction({ action: 'manifest', ...input });
}

export async function apiDownloadUrl(input: {
  projectId: string;
  collectorPin: string;
  stampId: string;
}): Promise<{ meta: Record<string, unknown>; url: string; expiresIn: number }> {
  return postAction({ action: 'downloadUrl', ...input });
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
    case 'project_closed':
      return '종료된 사업에는 올리거나 초대할 수 없습니다.';
    case 'invalid_template':
      return '저장 템플릿이 올바르지 않습니다.';
    case 'use_prepare_upload':
    case 'use_download_url':
      return '앱을 최신 버전으로 업데이트해 주세요.';
    case 'incomplete_upload':
      return '사진 올리기가 끝나지 않았습니다. 다시 시도해 주세요.';
    case 'stamp_not_found':
      return '사진을 찾을 수 없습니다.';
    case 'put_failed':
      return '일시 저장소에 올리지 못했습니다. 네트워크를 확인해 주세요.';
    case 'not_found':
      return '사업을 찾을 수 없습니다.';
    default:
      return e instanceof Error ? e.message : '요청에 실패했습니다.';
  }
}
