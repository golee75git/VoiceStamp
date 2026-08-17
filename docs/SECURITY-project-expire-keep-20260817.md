# 보안·라이선스·특허 점검 — 만료 사업 유지·종료 안내 (2026-08-17)

## 변경 요약
- 보관이 끝난 만든 사업을 목록에서 자동으로 지우지 않는다. 「만료됨」으로 두고 수신함은 내 폰으로 가져온 사진만 보인다.
- 빼기는 확인 후 `removeOwnedProject`(목록·PIN만). 이미 가져온 스탬프는 남긴다.
- 종료된 사업: 참여 기기는 푸시 없이, 기존 `lookup`(종료·없음 모두 404)과 올리기 오류로 안내한 뒤 연결을 끊는다.
- 신규 npm 없음. 자동 전량 다운로드 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `src/services/joinEndedNotice.ts`, `restore-project-expire-keep.bat`, 본 문서 |
| **재사용·수정** | `projectCollectSettings.ts`, `projectCollectApi.ts`, `projectUploadQueue.ts`, `ProjectCollectScreen.tsx`, `CameraScreen.tsx`, `public/help.html`, `public/privacy.html`, `docs/PRIVACY.md`, `RESTORE.md` |
| **재사용(무수정)** | `projectImportService.ts`, `projectImportedStamps.ts`, `api/project.js`, `clearProjectJoin` |
| **스냅샷** | `src.pre-project-expire-keep/`, `public.pre-project-expire-keep/`, `docs.pre-project-expire-keep/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 기존 시스템 UI.

## 의존성·GPL
- npm/Gradle 추가 없음. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| PIN | 기기에만. 만료 후 서버 호출은 수신을 열고 남은 사진 받기를 고른 때, 또는 기존 수신 PIN 경로 |
| lookup | 종료와 없음을 구분하지 않음(404). 공개 `closed` 플래그 추가 없음 |
| 자동 받기 | 없음. 남은 장 받기는 확인 후이며 이때 서버 삭제는 켜지 않음 |
| 네트워크 오류 | 연결을 끊지 않음 |
| 권한 | 푸시·알림 권한 없음 |
| Data safety | 신규 수집 유형 없음. 클라우드 일시 저장은 기존과 같음 |
| Play | 스토어 권한·데이터 유형 변경 없음 |

## 저작권·독자성
- 기존 종료됨 유지·lookup·내 폰으로 가져오기를 이어서 쓴 것. 외부 보관함·푸시 예제 복사 없음.
- 식별자 `project-expire-keep`·`joinEndedNotice`·`isOwnedExpired`·`noticeJoinEndedIfGone`은 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 만료 후 로컬 목록 유지·확인 후 삭제·앱 열 때 상태 확인은 일반 UX 수준일 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-project-expire-keep.bat`

## 배포
- APK: `VoiceStamp_20260817_094535.apk` (`5c32fb9`)
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260817_094535.apk
