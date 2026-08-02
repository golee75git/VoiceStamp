# 보안·라이선스·특허 점검 — 목록 저장 유형 필터 (2026-08-02)

## 변경 요약
- `stamps.template_id` 컬럼 추가(마이그레이션). 저장·수정 시 활성 저장 템플릿 id 기록
- 저장 목록: 가로 칩(전체·템플릿·미분류) 필터 + 행에 유형 이름 표시
- 기존 NULL = 미분류. 삭제된 커스텀 템플릿 id는 「삭제된 유형」

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-template-list-filter.bat`, 본 문서 |
| **재사용·수정** | `stamp.ts`, `schema.ts`, `database.ts`, `stampRepository.ts`, `saveStamp.ts`, `stampFieldTemplates.ts`, `StampListScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-template-list-filter/`, `public.pre-template-list-filter/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만 사용.

## 의존성·GPL
- **신규 npm/Gradle 없음.**

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한·네트워크 | 변경 없음 |
| 입력 | `template_id`는 기존 템플릿 id 규칙(`[a-z0-9-]`, 최대 64)으로 정규화 |
| Data safety | 기기 로컬 SQLite만. 외부 전송 없음 |

## 저작권·독자성
- VoiceStamp 저장 템플릿·목록 UI를 확장. 외부 앱 분류 UI 복사 없음.
- SQLite ALTER·칩 필터는 일반 관용 패턴.

## 특허 검토 메모 (보장 아님)
- 로컬 태그/유형 필터·표시는 일반 목록 UX. **특허 비침해를 보장하지 않음.**

## 롤백
`restore-template-list-filter.bat`  
(참고: 이미 추가된 DB 컬럼 `template_id`는 롤백 bat이 DROP하지 않음. 앱은 컬럼을 무시해도 동작.)
