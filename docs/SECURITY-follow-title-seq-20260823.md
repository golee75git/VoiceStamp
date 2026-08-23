# 보안·라이선스·특허 점검 — 이음 제목 번호 (2026-08-23)

## 변경 요약
- 이음 저장 초안에만 처음 제목 + `(이음 n)`을 채운다.
- 저장 경로는 입력칸 `title`을 그대로 쓴다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-follow-title-seq.bat`, 본 문서, `docs/DESIGN-follow-title-seq-20260823.md` |
| **재사용·수정** | `src/components/StampSaveModal.tsx`, `src/services/stampRepository.ts`, `public/help.html`, RESTORE, PRD/PLAN/PROJECT/CHANGELOG/README, `수정기록.txt`, LICENSE-NOTICE |
| **재사용(무수정)** | `src/services/saveStamp.ts`, `src/constants/apkBuildLabel.ts`(빌드 시 파일명만) |
| **스냅샷** | `src.pre-follow-title-seq/`, `public.pre-follow-title-seq/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 글자만.
- 저장소에 `.ttf` / `.otf` / `.woff` 없음.

## 의존성·GPL
- npm 추가 없음.
- 기존 `jszip` MIT 경로 유지. GPL 경로 신규 채택 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 없음. 기기 SQLite COUNT만 |
| 권한 | 변경 없음 |
| 입력 | `parent_id`는 기존 `normalizeParentId` 문자 집합. COUNT 바인딩만 |
| Play | 데이터 유형·민감 권한 변경 없음 |

## 저작권·독자성
- 식별자 `FOLLOW_TITLE_SEQ`, `countFollowLinkChildren`, `restore-follow-title-seq`는 이 프로젝트 전용.
- 기존 `(이음)` 초안 함수에 번호만 더한 것이며 외부 앱 UI를 베끼지 않음.

## 특허 검토 메모 (보장 아님)
- 같은 제목 뒤에 순번을 붙이는 것은 일반 명명 관용일 수 있음.
- **특허 비침해를 보장하지 않음.** 별도 청구항 대조가 필요하면 법무에서 검토한다.

## 롤백
`restore-follow-title-seq.bat`

## 배포
- APK: `VoiceStamp_20260823_143912.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260823_143912.apk
- 사이트: https://voicestamp-gilt.vercel.app/
