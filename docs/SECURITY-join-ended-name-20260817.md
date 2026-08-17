# 보안·라이선스·특허 점검 — 종료 안내 사업명 (2026-08-17)

## 변경 요약
- 참여 종료 안내에 이 기기에 저장된 사업 이름을 넣는다. 없으면 「이 사업」.
- 서버에서 이름을 다시 받지 않음. npm 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-join-ended-name.bat`, 본 문서 |
| **재사용·수정** | `src/services/joinEndedNotice.ts`, `public/help.html`, `RESTORE.md` |
| **재사용(무수정)** | `getProjectJoin`의 `name`(최대 40자, 참여 시 저장) |
| **스냅샷** | `src.pre-join-ended-name/`, `public.pre-join-ended-name/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음.

## 의존성·GPL
- npm/Gradle 추가 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 이름 | 기기 안 참여 기록만. Alert 텍스트, HTML 아님 |
| 길이 | 40자 상한 유지 |
| 수집 | 신규 없음 |
| Play | 데이터 유형 변경 없음 |

## 저작권·독자성
- 기존 종료 안내 문구에 로컬 이름만 붙인 것. 외부 알림 예제 복사 없음.
- 식별자 `join-ended-name`·`joinEndedBody`는 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 알림에 로컬 이름을 넣는 구성은 일반 UX.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-join-ended-name.bat`

## 배포
- APK: `VoiceStamp_20260817_101059.apk` (`1730c0f`)
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260817_101059.apk
