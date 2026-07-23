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
