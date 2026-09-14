# 보안·라이선스·특허 점검 — 목록 사업 보내기 고르기·연결 확인 (2026-09-14)

## 변경 요약
- 저장 목록 **사업으로 보내기** 고르기 창: 카드에서 탭이 바깥 닫기로 올라가지 않게 한다. 사업 이름을 눌러 고른다.
- 고른 사업이 종료·만료이면 올리지 않는다. 보내기 전에 기존 `lookup`으로 사업이 열려 있는지 확인하고, 연결 기록이 없으면 안내한다.
- 신규 npm·권한·네트워크 액션 없음. 허브 갤러리 보내기의 기존 `apiLookupProject`·`joinHistoryUploadBlocked`·`connectJoinForSend`를 재사용한다.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **신규** | `restore-join-list-send-check.bat`, 본 문서 |
| **수정** | `src/components/StampListScreen.tsx`, `public/help.html`, `RESTORE.md`, `docs/README.md` |
| **재사용** | `joinHistoryUploadBlocked`, `apiLookupProject`, `isProjectGoneApiError`, `connectJoinForSend`, `queueStampsToCurrentJoin`, `getProjectJoin`, `listOwnedProjects` |
| **스냅샷** | `src.pre-join-list-send-check/`, `public.pre-join-list-send-check/` |

## 글꼴·의존성·GPL
- 폰트 파일·웹폰트 **추가 없음**. 앱은 시스템 글꼴. 기존 OFL 자산 변경 없음.
- npm 추가 없음.
- GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play

| 항목 | 결과 |
|------|------|
| 데이터 | 올리는 대상은 이 기기가 이미 참여한 사업만. 수집 PIN은 쓰지 않음 |
| 권한 | 추가 없음 |
| 네트워크 | 기존 `lookup` / `prepareUpload` / Put / `completeUpload`만. 새 액션 없음 |
| 종료 사업 | 로컬 종료·만료 표시 후 큐에 넣지 않음. `lookup`이 없으면 이력에 종료 표시 |
| Data safety | 신규 수집 항목 없음 |
| Play | 스토어 권한 선언 변경 없음. 웹에서는 올리지 않음 |

## 특허
- 특허 비침해를 보장하지 않음.
- 고르기 창 탭 가로채기와 보내기 전 조회는 일반 앱 패턴일 수 있음. 청구항 대조가 필요하면 법무에서 검토.
- GitHub 코드 검색: `joinSendActiveId`·`joinSendOwned`·`joinSendRowBlocked`는 이 프로젝트 식별자.

## 롤백
`restore-join-list-send-check.bat`

## 배포
- APK: `VoiceStamp_20260914_223408.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260914_223408.apk
