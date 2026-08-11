# 보안·라이선스·특허 점검 — 사진대지기록 기본 템플릿 (2026-08-11)

## 변경 요약
- 기본 저장 템플릿 배열에 **사진대지기록**(`photo-sheet`) 추가.
- 칸 이름: 촬영대상·촬영위치·사진설명·시설구분·확인사항·사진구분 (기기 내 표시명만, DB 컬럼 동일).
- 도움말 기본 템플릿 목록에 이름 추가.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `src/services/stampFieldTemplates.ts`, `public/help.html` |
| **신규** | 본 문서, `restore-photo-sheet-template.bat`, `src.pre-photo-sheet-template/`, `public.pre-photo-sheet-template/` |
| **재사용** | 기존 `STAMP_FIELD_TEMPLATES`·내 템플릿·초대 템플릿 경로 (신규 npm 없음) |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만.

## 의존성·GPL
- **신규 npm 없음.** jszip MIT / node-forge BSD 경로 유지. GPL 미채택.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 데이터 | 기기 내 기존 템플릿·스탬프 경로만. 신규 네트워크·권한 없음 |
| Data safety | 수집 항목 변경 없음 |
| 헬스체크 | 템플릿 상수만 — A/B/C 핫패스 미변경 |

## 특허
- 특허 비침해를 보장하지 않음. 필드 라벨 프리셋은 일반 UI 구성일 수 있음.

## 롤백
```bat
restore-photo-sheet-template.bat
```
