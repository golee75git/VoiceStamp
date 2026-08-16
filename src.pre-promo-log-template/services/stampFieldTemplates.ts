import { getDatabase } from '../db/database';
import type { FieldLabels } from './fieldLabels';
import {
  DEFAULT_FIELD_EXTRA1_LABEL,
  DEFAULT_FIELD_EXTRA2_LABEL,
  DEFAULT_FIELD_EXTRA3_LABEL,
  DEFAULT_FIELD_MEMO_LABEL,
  DEFAULT_FIELD_PLACE_LABEL,
  DEFAULT_FIELD_TITLE_LABEL,
  resolveFieldLabels,
  sanitizeFieldLabel,
} from './fieldLabels';
import {
  getExtra1FieldLabel,
  getExtra2FieldLabel,
  getExtra3FieldLabel,
  getMemoFieldLabel,
  getPlaceFieldLabel,
  getTitleFieldLabel,
  setExtra1FieldLabel,
  setExtra2FieldLabel,
  setExtra3FieldLabel,
  setMemoFieldLabel,
  setPlaceFieldLabel,
  setTitleFieldLabel,
} from './settingsService';
import {
  invalidateStampSaveModalLayoutCache,
  loadStampSaveModalLayoutSettings,
  patchStampSaveModalLayoutFieldLabels,
  peekStampSaveModalLayoutCache,
} from './stampSaveModalLayoutCache';

/** Example placeholders shown faded in save inputs (not stored as stamp values). */
export type FieldPlaceholders = {
  title: string;
  place: string;
  memo: string;
  extra1: string;
  extra2: string;
  extra3: string;
};

export type StampFieldTemplate = {
  id: string;
  name: string;
  labels: FieldLabels;
  placeholders: FieldPlaceholders;
  /** User-defined templates stored in app_settings (not bundled). */
  custom?: boolean;
};

const CUSTOM_FIELD_TEMPLATES_KEY = 'custom_field_templates';
const ACTIVE_FIELD_TEMPLATE_ID_KEY = 'active_field_template_id';
const CUSTOM_ID_PREFIX = 'custom-';
const ACTIVE_TEMPLATE_ID_MAX = 64;
export const CUSTOM_TEMPLATE_NAME_MAX = 40;
export const CUSTOM_TEMPLATE_PLACEHOLDER_MAX = 80;
export const MAX_CUSTOM_FIELD_TEMPLATES = 30;

/** How current field labels relate to the last applied save template. */
export type ActiveStampFieldTemplateStatus =
  | { kind: 'none' }
  | { kind: 'applied'; templateId: string; name: string }
  | { kind: 'userModified'; templateId: string | null; name: string | null };

export const DEFAULT_CUSTOM_TEMPLATE_LABELS: FieldLabels = {
  titleFieldLabel: DEFAULT_FIELD_TITLE_LABEL,
  placeFieldLabel: DEFAULT_FIELD_PLACE_LABEL,
  memoFieldLabel: DEFAULT_FIELD_MEMO_LABEL,
  extra1FieldLabel: DEFAULT_FIELD_EXTRA1_LABEL,
  extra2FieldLabel: DEFAULT_FIELD_EXTRA2_LABEL,
  extra3FieldLabel: DEFAULT_FIELD_EXTRA3_LABEL,
};

const EMPTY_PLACEHOLDERS: FieldPlaceholders = {
  title: '',
  place: '',
  memo: '',
  extra1: '',
  extra2: '',
  extra3: '',
};

/** Built-in save templates (field display names + example hints). Capture time stays app-generated. */
export const STAMP_FIELD_TEMPLATES: StampFieldTemplate[] = [
  {
    id: 'work-content',
    name: '작업내용기록',
    labels: {
      titleFieldLabel: '작업명',
      placeFieldLabel: '장소',
      memoFieldLabel: '작업내용',
      extra1FieldLabel: '구분',
      extra2FieldLabel: '비고',
      extra3FieldLabel: '상태',
    },
    placeholders: {
      title: '회의실 빔프로젝터 점검',
      place: '본관 3층 대회의실',
      memo: '램프 수명 확인, 리모컨 건전지 교체',
      extra1: '사무',
      extra2: '예비 램프 재고 없음',
      extra3: '완료',
    },
  },
  {
    id: 'event-record',
    name: '행사기록',
    labels: {
      titleFieldLabel: '행사명',
      placeFieldLabel: '장소',
      memoFieldLabel: '행사내용',
      extra1FieldLabel: '주관',
      extra2FieldLabel: '비고',
      extra3FieldLabel: '단계',
    },
    placeholders: {
      title: '마을 가을 축제',
      place: '○○공원 야외무대',
      memo: '개막식·체험부스·공연 진행',
      extra1: '○○주민자치회',
      extra2: '음향 점검 완료, 우천 시 실내 전환',
      extra3: '진행',
    },
  },
  {
    id: 'accident-probe',
    name: '사고조사기록',
    labels: {
      titleFieldLabel: '사고유형',
      placeFieldLabel: '발생장소',
      memoFieldLabel: '발생경위',
      extra1FieldLabel: '피해정도',
      extra2FieldLabel: '원인·추정',
      extra3FieldLabel: '조치상태',
    },
    placeholders: {
      title: '미끄러짐',
      place: '본관 1층 현관 계단',
      memo: '빗물로 바닥이 젖은 상태에서 보행 중 미끄러짐',
      extra1: '경상',
      extra2: '바닥 물기, 미끄럼 방지 미흡',
      extra3: '조사 중',
    },
  },
  {
    id: 'inquiry-log',
    name: '탐구기록',
    labels: {
      titleFieldLabel: '탐구주제',
      placeFieldLabel: '탐구장소',
      memoFieldLabel: '탐구내용',
      extra1FieldLabel: '가설·질문',
      extra2FieldLabel: '관찰·결과',
      extra3FieldLabel: '단계',
    },
    placeholders: {
      title: '공원 나무의 잎 모양 비교',
      place: '○○근린공원',
      memo: '잎 가장자리·잎맥을 사진으로 기록',
      extra1: '햇빛이 많은 쪽이 잎이 더 두꺼울까',
      extra2: '양지 쪽 잎이 더 두껍고 진함',
      extra3: '관찰',
    },
  },
  {
    id: 'travel-log',
    name: '여행기록',
    labels: {
      titleFieldLabel: '여행지',
      placeFieldLabel: '장소',
      memoFieldLabel: '여행내용',
      extra1FieldLabel: '동행',
      extra2FieldLabel: '비고',
      extra3FieldLabel: '일정',
    },
    placeholders: {
      title: '경주 불국사',
      place: '경주시 진현동',
      memo: '대웅전·다보탑 관람, 느낀 점',
      extra1: '가족',
      extra2: '주차 혼잡, 입장 30분 대기',
      extra3: '체류',
    },
  },
  {
    id: 'experience-trip-presurvey',
    name: '체험여행 사전답사기록',
    labels: {
      titleFieldLabel: '여행명',
      placeFieldLabel: '답사장소',
      memoFieldLabel: '답사내용',
      extra1FieldLabel: '체험활동',
      extra2FieldLabel: '확인사항',
      extra3FieldLabel: '답사단계',
    },
    placeholders: {
      title: '춘천 레일바이크·닭갈비 체험',
      place: '○○역 광장 / 체험장 입구',
      memo: '이동 동선·소요시간·체험 가능 인원 확인',
      extra1: '레일바이크 / 도예 / 숲해설',
      extra2: '우천 대안·화장실·점심·안전수칙',
      extra3: '1차 / 재답사 / 확정',
    },
  },
  {
    id: 'safety-site',
    name: '안전현장기록',
    labels: {
      titleFieldLabel: '점검대상',
      placeFieldLabel: '위치',
      memoFieldLabel: '현장내용',
      extra1FieldLabel: '위험도',
      extra2FieldLabel: '조치요청',
      extra3FieldLabel: '처리상태',
    },
    placeholders: {
      title: '천장 마감재',
      place: '○○초등학교 본관 2층 복도',
      memo: '천장 누수 흔적 및 마감재 변색 확인',
      extra1: '높음',
      extra2: '누수 원인 확인 및 천장 보수',
      extra3: '조치 요청',
    },
  },
  {
    id: 'construction-site',
    name: '공사현장기록',
    labels: {
      titleFieldLabel: '공사명',
      placeFieldLabel: '위치',
      memoFieldLabel: '현장내용',
      extra1FieldLabel: '공사단계',
      extra2FieldLabel: '확인사항',
      extra3FieldLabel: '공사상태',
    },
    placeholders: {
      title: '본관 화장실 환경개선공사',
      place: '본관 1층 남자화장실',
      memo: '기존 배관 철거 및 신규 배관 설치',
      extra1: '공사 진행 중',
      extra2: '배관 연결부 누수 여부 확인 필요',
      extra3: '정상 진행',
    },
  },
  {
    id: 'photo-sheet',
    name: '사진대지기록',
    labels: {
      titleFieldLabel: '촬영대상',
      placeFieldLabel: '촬영위치',
      memoFieldLabel: '사진설명',
      extra1FieldLabel: '시설구분',
      extra2FieldLabel: '확인사항',
      extra3FieldLabel: '사진구분',
    },
    placeholders: {
      title: '옥상 방수층',
      place: '본관 옥상 동측',
      memo: '도막 균열 및 물고임 확인',
      extra1: '건축',
      extra2: '누수 여부 재확인',
      extra3: '현황',
    },
  },
  {
    id: 'edu-activity',
    name: '교육활동기록',
    labels: {
      titleFieldLabel: '활동명',
      placeFieldLabel: '학년·반',
      memoFieldLabel: '활동내용',
      extra1FieldLabel: '관찰내용',
      extra2FieldLabel: '학생생각',
      extra3FieldLabel: '활동단계',
    },
    placeholders: {
      title: '과학 식물 성장 관찰',
      place: '5학년 2반',
      memo: '햇빛의 양에 따른 식물 성장 비교',
      extra1: '햇빛을 많이 받은 화분의 줄기가 더 굵게 자람',
      extra2: '햇빛이 식물 성장에 영향을 준다고 판단함',
      extra3: '탐구 결과 확인',
    },
  },
  {
    id: 'meal-hygiene',
    name: '급식 위생·안전점검',
    labels: {
      titleFieldLabel: '점검항목',
      placeFieldLabel: '위치',
      memoFieldLabel: '점검내용',
      extra1FieldLabel: '위험요소',
      extra2FieldLabel: '조치요청',
      extra3FieldLabel: '점검결과',
    },
    placeholders: {
      title: '조리실 바닥 및 배수구',
      place: '○○초등학교 급식실',
      memo: '배수구 주변 물 고임 확인',
      extra1: '미끄러짐 및 위생관리 우려',
      extra2: '배수구 청소 및 배수상태 점검',
      extra3: '개선 필요',
    },
  },
  {
    id: 'school-support',
    name: '학교현장지원기록',
    labels: {
      titleFieldLabel: '학교명',
      placeFieldLabel: '지원위치',
      memoFieldLabel: '장애내용',
      extra1FieldLabel: '지원분야',
      extra2FieldLabel: '조치내용',
      extra3FieldLabel: '처리결과',
    },
    placeholders: {
      title: '○○중학교',
      place: '본관 3층 교무실',
      memo: '무선인터넷 접속 불안정',
      extra1: '정보통신·무선네트워크',
      extra2: 'AP 재설정 및 네트워크 채널 변경',
      extra3: '정상 작동 확인',
    },
  },
  {
    id: 'school-asset',
    name: '학교자산점검기록',
    labels: {
      titleFieldLabel: '장비명',
      placeFieldLabel: '설치위치',
      memoFieldLabel: '고장내용',
      extra1FieldLabel: '자산번호',
      extra2FieldLabel: '조치요청',
      extra3FieldLabel: '처리상태',
    },
    placeholders: {
      title: '전자칠판',
      place: '○○초등학교 4학년 1반',
      memo: '화면 우측 일부가 표시되지 않음',
      extra1: '2024-정보-015',
      extra2: '유지보수 업체 점검 요청',
      extra3: '수리 요청',
    },
  },
  {
    id: 'disaster-report',
    name: '재난·긴급 현장보고',
    labels: {
      titleFieldLabel: '발생유형',
      placeFieldLabel: '발생위치',
      memoFieldLabel: '현장상황',
      extra1FieldLabel: '위험여부',
      extra2FieldLabel: '긴급조치',
      extra3FieldLabel: '처리상태',
    },
    placeholders: {
      title: '집중호우로 인한 침수',
      place: '본관 지하 기계실 입구',
      memo: '바닥 약 5cm 물 고임 확인',
      extra1: '전기설비 접근 위험',
      extra2: '출입 통제 및 전원 상태 확인 요청',
      extra3: '긴급 대응 중',
    },
  },
  {
    id: 'complaint-site',
    name: '민원현장확인기록',
    labels: {
      titleFieldLabel: '민원유형',
      placeFieldLabel: '확인위치',
      memoFieldLabel: '민원내용',
      extra1FieldLabel: '현장확인',
      extra2FieldLabel: '조치내용',
      extra3FieldLabel: '처리상태',
    },
    placeholders: {
      title: '학교시설 관련',
      place: '운동장 동쪽 배수로',
      memo: '우천 시 물 고임 발생',
      extra1: '배수로 일부에 토사와 낙엽이 쌓여 있음',
      extra2: '배수로 청소 및 배수상태 재점검',
      extra3: '조치 완료',
    },
  },
];

let activePlaceholders: FieldPlaceholders = { ...EMPTY_PLACEHOLDERS };

export function getActiveFieldPlaceholders(): FieldPlaceholders {
  return { ...activePlaceholders };
}

export function clearActiveFieldPlaceholders(): void {
  activePlaceholders = { ...EMPTY_PLACEHOLDERS };
}

export function isCustomStampFieldTemplateId(id: string): boolean {
  return id.startsWith(CUSTOM_ID_PREFIX);
}

function sanitizePlaceholder(text: string): string {
  return text.trim().replace(/\s+/g, ' ').slice(0, CUSTOM_TEMPLATE_PLACEHOLDER_MAX);
}

function sanitizePlaceholders(partial?: Partial<FieldPlaceholders> | null): FieldPlaceholders {
  return {
    title: sanitizePlaceholder(partial?.title ?? ''),
    place: sanitizePlaceholder(partial?.place ?? ''),
    memo: sanitizePlaceholder(partial?.memo ?? ''),
    extra1: sanitizePlaceholder(partial?.extra1 ?? ''),
    extra2: sanitizePlaceholder(partial?.extra2 ?? ''),
    extra3: sanitizePlaceholder(partial?.extra3 ?? ''),
  };
}

function sanitizeTemplateName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, CUSTOM_TEMPLATE_NAME_MAX);
}

function createCustomTemplateId(): string {
  return `${CUSTOM_ID_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseCustomTemplates(raw: string | null): StampFieldTemplate[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: StampFieldTemplate[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      if (typeof row.id !== 'string' || !isCustomStampFieldTemplateId(row.id)) continue;
      if (typeof row.name !== 'string') continue;
      const name = sanitizeTemplateName(row.name);
      if (!name) continue;
      const labels = resolveFieldLabels(row.labels as Partial<FieldLabels> | null);
      const placeholders = sanitizePlaceholders(row.placeholders as Partial<FieldPlaceholders> | null);
      out.push({ id: row.id, name, labels, placeholders, custom: true });
      if (out.length >= MAX_CUSTOM_FIELD_TEMPLATES) break;
    }
    return out;
  } catch {
    return [];
  }
}

async function readCustomTemplatesRaw(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    CUSTOM_FIELD_TEMPLATES_KEY,
  );
  return row?.value ?? null;
}

async function writeCustomTemplates(list: StampFieldTemplate[]): Promise<void> {
  const payload = list.map((item) => ({
    id: item.id,
    name: item.name,
    labels: item.labels,
    placeholders: item.placeholders,
  }));
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    CUSTOM_FIELD_TEMPLATES_KEY,
    JSON.stringify(payload),
  );
}

function sanitizeActiveTemplateId(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const id = raw.trim().slice(0, ACTIVE_TEMPLATE_ID_MAX);
  if (!id) return null;
  // Built-in ids are kebab-case; custom ids use custom-<alnum>-<alnum>.
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/i.test(id)) return null;
  return id;
}

function fieldLabelsEqual(a: FieldLabels, b: FieldLabels): boolean {
  return (
    a.titleFieldLabel === b.titleFieldLabel &&
    a.placeFieldLabel === b.placeFieldLabel &&
    a.memoFieldLabel === b.memoFieldLabel &&
    a.extra1FieldLabel === b.extra1FieldLabel &&
    a.extra2FieldLabel === b.extra2FieldLabel &&
    a.extra3FieldLabel === b.extra3FieldLabel
  );
}

async function readActiveTemplateId(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    ACTIVE_FIELD_TEMPLATE_ID_KEY,
  );
  return sanitizeActiveTemplateId(row?.value ?? null);
}

async function writeActiveTemplateId(templateId: string): Promise<void> {
  const safe = sanitizeActiveTemplateId(templateId);
  if (!safe) return;
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ACTIVE_FIELD_TEMPLATE_ID_KEY,
    safe,
  );
}

/** Current field display names from app settings (same source as save/settings screens). */
export async function loadCurrentFieldLabels(): Promise<FieldLabels> {
  return resolveFieldLabels({
    titleFieldLabel: await getTitleFieldLabel(),
    placeFieldLabel: await getPlaceFieldLabel(),
    memoFieldLabel: await getMemoFieldLabel(),
    extra1FieldLabel: await getExtra1FieldLabel(),
    extra2FieldLabel: await getExtra2FieldLabel(),
    extra3FieldLabel: await getExtra3FieldLabel(),
  });
}

/**
 * Resolve whether the last applied template still matches current labels.
 * If no stored id, falls back to label match against built-in/custom templates (display only).
 */
export async function getActiveStampFieldTemplateStatus(): Promise<ActiveStampFieldTemplateStatus> {
  const current = await loadCurrentFieldLabels();
  const storedId = await readActiveTemplateId();

  if (storedId) {
    const template = await findStampFieldTemplate(storedId);
    if (template && fieldLabelsEqual(current, resolveFieldLabels(template.labels))) {
      return { kind: 'applied', templateId: template.id, name: template.name };
    }
    return {
      kind: 'userModified',
      templateId: storedId,
      name: template?.name ?? null,
    };
  }

  const customs = await listCustomStampFieldTemplates();
  for (const template of [...customs, ...STAMP_FIELD_TEMPLATES]) {
    if (fieldLabelsEqual(current, resolveFieldLabels(template.labels))) {
      return { kind: 'applied', templateId: template.id, name: template.name };
    }
  }
  // Labels differ from every known template (manual edit before this feature, or defaults).
  const defaults = resolveFieldLabels(null);
  if (fieldLabelsEqual(current, defaults)) {
    return { kind: 'none' };
  }
  return { kind: 'userModified', templateId: null, name: null };
}

/** User-defined templates only (device-local SQLite). */
export async function listCustomStampFieldTemplates(): Promise<StampFieldTemplate[]> {
  return parseCustomTemplates(await readCustomTemplatesRaw());
}

export async function findStampFieldTemplate(templateId: string): Promise<StampFieldTemplate | null> {
  const builtin = STAMP_FIELD_TEMPLATES.find((item) => item.id === templateId);
  if (builtin) return { ...builtin, labels: { ...builtin.labels }, placeholders: { ...builtin.placeholders } };
  const customs = await listCustomStampFieldTemplates();
  return customs.find((item) => item.id === templateId) ?? null;
}

export type UpsertCustomStampFieldTemplateInput = {
  /** Omit to create; set to update an existing custom template. */
  id?: string;
  name: string;
  labels: FieldLabels;
  placeholders?: FieldPlaceholders;
};

/** Create or update a user template. Built-ins are never overwritten. */
export async function upsertCustomStampFieldTemplate(
  input: UpsertCustomStampFieldTemplateInput,
): Promise<StampFieldTemplate> {
  const name = sanitizeTemplateName(input.name);
  if (!name) {
    throw new Error('템플릿 이름을 입력해 주세요.');
  }
  const labels = resolveFieldLabels({
    titleFieldLabel: sanitizeFieldLabel(input.labels.titleFieldLabel, DEFAULT_FIELD_TITLE_LABEL),
    placeFieldLabel: sanitizeFieldLabel(input.labels.placeFieldLabel, DEFAULT_FIELD_PLACE_LABEL),
    memoFieldLabel: sanitizeFieldLabel(input.labels.memoFieldLabel, DEFAULT_FIELD_MEMO_LABEL),
    extra1FieldLabel: sanitizeFieldLabel(input.labels.extra1FieldLabel, DEFAULT_FIELD_EXTRA1_LABEL),
    extra2FieldLabel: sanitizeFieldLabel(input.labels.extra2FieldLabel, DEFAULT_FIELD_EXTRA2_LABEL),
    extra3FieldLabel: sanitizeFieldLabel(input.labels.extra3FieldLabel, DEFAULT_FIELD_EXTRA3_LABEL),
  });
  const placeholders = sanitizePlaceholders(input.placeholders);

  const list = await listCustomStampFieldTemplates();
  if (input.id) {
    if (!isCustomStampFieldTemplateId(input.id)) {
      throw new Error('기본 템플릿은 수정할 수 없습니다.');
    }
    const index = list.findIndex((item) => item.id === input.id);
    if (index < 0) {
      throw new Error('내 템플릿을 찾을 수 없습니다.');
    }
    const updated: StampFieldTemplate = {
      id: input.id,
      name,
      labels,
      placeholders,
      custom: true,
    };
    list[index] = updated;
    await writeCustomTemplates(list);
    return updated;
  }

  if (list.length >= MAX_CUSTOM_FIELD_TEMPLATES) {
    throw new Error(`내 템플릿은 최대 ${MAX_CUSTOM_FIELD_TEMPLATES}개까지 저장할 수 있습니다.`);
  }
  const created: StampFieldTemplate = {
    id: createCustomTemplateId(),
    name,
    labels,
    placeholders,
    custom: true,
  };
  list.push(created);
  await writeCustomTemplates(list);
  return created;
}

export async function deleteCustomStampFieldTemplate(templateId: string): Promise<void> {
  if (!isCustomStampFieldTemplateId(templateId)) {
    throw new Error('기본 템플릿은 삭제할 수 없습니다.');
  }
  const list = await listCustomStampFieldTemplates();
  const next = list.filter((item) => item.id !== templateId);
  if (next.length === list.length) {
    throw new Error('내 템플릿을 찾을 수 없습니다.');
  }
  await writeCustomTemplates(next);
}

/**
 * Template id to store on a stamp row.
 * Prefers the current active/matched template; otherwise keeps an existing id (edit).
 */
export async function resolveStampTemplateIdForSave(
  existingId?: string | null,
): Promise<string | null> {
  const status = await getActiveStampFieldTemplateStatus();
  if (status.templateId) {
    return sanitizeActiveTemplateId(status.templateId);
  }
  return sanitizeActiveTemplateId(existingId ?? null);
}

/** Built-in then custom templates for list filter chips (id + display name). */
export async function listStampFieldTemplatesForFilter(): Promise<
  Array<{ id: string; name: string }>
> {
  const customs = await listCustomStampFieldTemplates();
  return [
    ...STAMP_FIELD_TEMPLATES.map((item) => ({ id: item.id, name: item.name })),
    ...customs.map((item) => ({ id: item.id, name: item.name })),
  ];
}

/** Apply a full template object (invite snapshot / custom) without requiring local catalog id. */
export async function applyStampFieldTemplateObject(
  template: StampFieldTemplate,
): Promise<StampFieldTemplate> {
  const labels = resolveFieldLabels(template.labels);
  await setTitleFieldLabel(labels.titleFieldLabel);
  await setPlaceFieldLabel(labels.placeFieldLabel);
  await setMemoFieldLabel(labels.memoFieldLabel);
  await setExtra1FieldLabel(labels.extra1FieldLabel);
  await setExtra2FieldLabel(labels.extra2FieldLabel);
  await setExtra3FieldLabel(labels.extra3FieldLabel);
  await writeActiveTemplateId(template.id);
  activePlaceholders = { ...sanitizePlaceholders(template.placeholders) };
  if (peekStampSaveModalLayoutCache()) {
    patchStampSaveModalLayoutFieldLabels(labels);
  } else {
    invalidateStampSaveModalLayoutCache();
    await loadStampSaveModalLayoutSettings();
  }
  return { ...template, labels, placeholders: { ...activePlaceholders } };
}

/** Apply template labels to app settings; placeholders are session hints for save inputs. */
export async function applyStampFieldTemplate(templateId: string): Promise<StampFieldTemplate> {
  const template = await findStampFieldTemplate(templateId);
  if (!template) {
    throw new Error('템플릿을 찾을 수 없습니다.');
  }
  return applyStampFieldTemplateObject(template);
}
