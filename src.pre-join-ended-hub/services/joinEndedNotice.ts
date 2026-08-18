import { Alert, Platform } from 'react-native';

import { apiLookupProject } from './projectCollectApi';
import { clearProjectJoin, getProjectJoin } from './projectCollectSettings';

const JOIN_ENDED_TITLE = '사업 종료';

const NOTICE_GAP_MS = 60_000;
let lastNoticeProjectId = '';
let lastNoticeAt = 0;

export function projectApiErrorCode(e: unknown): string {
  if (!(e instanceof Error)) return '';
  return String((e as Error & { code?: string }).code || e.message || '');
}

export function isProjectGoneApiError(e: unknown): boolean {
  const code = projectApiErrorCode(e);
  return code === 'not_found' || code === 'project_expired' || code === 'project_closed';
}

function joinEndedBody(name: string | null | undefined): string {
  const label = String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 40);
  const who = label || '이 사업';
  return who + '은 종료되어 더 이상 올리지 않습니다. 사진은 이 기기에만 남습니다.';
}

function showJoinEndedAlert(projectId: string, name: string | null | undefined): void {
  if (Platform.OS === 'web') return;
  const now = Date.now();
  if (lastNoticeProjectId === projectId && now - lastNoticeAt < NOTICE_GAP_MS) {
    return;
  }
  lastNoticeProjectId = projectId;
  lastNoticeAt = now;
  Alert.alert(JOIN_ENDED_TITLE, joinEndedBody(name));
}

/** Clear local join when lookup says the project is gone (closed and missing share 404). */
export async function noticeJoinEndedIfGone(): Promise<boolean> {
  const join = await getProjectJoin();
  if (!join) return false;
  try {
    await apiLookupProject(join.projectId);
    return false;
  } catch (e) {
    if (!isProjectGoneApiError(e)) return false;
    await clearProjectJoin();
    showJoinEndedAlert(join.projectId, join.name);
    return true;
  }
}

/** After an upload/join API failure: drop join only for gone/closed/expired codes. */
export async function clearJoinIfProjectGone(e: unknown): Promise<boolean> {
  if (!isProjectGoneApiError(e)) return false;
  const join = await getProjectJoin();
  await clearProjectJoin();
  showJoinEndedAlert(join?.projectId || 'gone', join?.name);
  return true;
}
