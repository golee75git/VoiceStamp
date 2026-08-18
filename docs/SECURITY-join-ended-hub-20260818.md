# 보안·라이선스·특허 점검 — 참여 목록 종료됨 표시 (2026-08-18)

## 변경 요약
- 허브 **참여한 사업** 줄에 만든 사업과 같은 「종료됨」·「만료됨」을 붙인다.
- 올리기가 막힌 줄에서는 **갤러리 보내기**·**다시 연결**을 숨기고 **보낸 사진**·**목록에서 빼기**만 남긴다.
- 종료를 이 기기가 했거나, lookup이 없·종료·만료를 알려 준 뒤에만 참여 이력에 `endedAt`을 적는다. 서버에서 이름을 다시 받지 않음. npm 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-join-ended-hub.bat`, 본 문서 |
| **재사용·수정** | `src/services/projectCollectSettings.ts`, `src/services/joinEndedNotice.ts`, `src/components/ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **재사용(무수정)** | `apiLookupProject`, `markOwnedProjectClosed`, `isOwnedExpired` |
| **스냅샷** | `src.pre-join-ended-hub/`, `public.pre-join-ended-hub/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 기존 시스템 UI.

## 의존성·GPL
- npm/Gradle 추가 없음. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 종료 시각 | 기기 안 참여 이력 JSON만. 서버로 보내지 않음 |
| lookup | 기존 404 공유(종료와 없음 구분 안 함). 공개 `closed` 플래그 추가 없음 |
| 버튼 | 숨김만. 눌러서 올리기 우회 경로를 새로 열지 않음 |
| 수집 | 신규 없음 |
| Play | 데이터 유형·권한 변경 없음 |

## 저작권·독자성
- 만든 사업 줄의 「종료됨」표시와 같은 허브 문구를 참여 줄에 이어서 쓴 것. 외부 대시보드 예제 복사 없음.
- 식별자 `join-ended-hub`·`joinHistoryUploadBlocked`·`markJoinedProjectEnded`·`endedAt`(참여 이력)는 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 목록에 종료 글자를 붙이고 올리기 단추를 숨기는 구성은 일반 UX 수준일 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-join-ended-hub.bat`

## 배포
- APK: `VoiceStamp_20260818_091805.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260818_091805.apk
