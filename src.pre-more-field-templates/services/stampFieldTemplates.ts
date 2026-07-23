import type { FieldLabels } from './fieldLabels';
import { resolveFieldLabels } from './fieldLabels';
import {
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
];

let activePlaceholders: FieldPlaceholders = { ...EMPTY_PLACEHOLDERS };

export function getActiveFieldPlaceholders(): FieldPlaceholders {
  return { ...activePlaceholders };
}

export function clearActiveFieldPlaceholders(): void {
  activePlaceholders = { ...EMPTY_PLACEHOLDERS };
}

/** Apply template labels to app settings; placeholders are session hints for save inputs. */
export async function applyStampFieldTemplate(templateId: string): Promise<StampFieldTemplate> {
  const template = STAMP_FIELD_TEMPLATES.find((item) => item.id === templateId);
  if (!template) {
    throw new Error('템플릿을 찾을 수 없습니다.');
  }

  const labels = resolveFieldLabels(template.labels);
  await setTitleFieldLabel(labels.titleFieldLabel);
  await setPlaceFieldLabel(labels.placeFieldLabel);
  await setMemoFieldLabel(labels.memoFieldLabel);
  await setExtra1FieldLabel(labels.extra1FieldLabel);
  await setExtra2FieldLabel(labels.extra2FieldLabel);
  await setExtra3FieldLabel(labels.extra3FieldLabel);

  activePlaceholders = { ...template.placeholders };
  // Keep save-modal layout cache in sync so the first paint shows template labels (no 제목/장소 flash).
  if (peekStampSaveModalLayoutCache()) {
    patchStampSaveModalLayoutFieldLabels(labels);
  } else {
    invalidateStampSaveModalLayoutCache();
    await loadStampSaveModalLayoutSettings();
  }
  return { ...template, labels };
}
