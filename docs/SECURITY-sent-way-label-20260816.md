# SECURITY — 보낸 사진 갤러리·촬영 표시 (2026-08-16)

## 변경 요약
- 사업 취합 **보낸 사진** 행 둘째 줄에 `갤러리` 또는 `촬영`을 기존 전송 상태·시각과 같은 글자로 붙인다.
- 값은 기기 로컬 업로드 기록 `joinSendWay`만 쓴다. 서버 메타·스탬프 테이블 컬럼 추가 없음.
- 이전 전송분은 값이 없어 상태·시각만 보인다.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **신규** | `restore-sent-way-label.bat`, 본 문서 |
| **수정** | `projectCollectSettings.ts`, `projectUploadQueue.ts`, `saveStamp.ts`, `joinStampSend.ts`, `ProjectSentList.tsx`, `StampSaveModal.tsx`, `StampListScreen.tsx`, `public/help.html`, `RESTORE.md`, `docs/README.md` |
| **재사용** | `setUploadStatus`, `getUploadRecordMap`, `styles.sub` |
| **스냅샷** | `src.pre-sent-way-label/`, `public.pre-sent-way-label/` |

## 글꼴·의존성·GPL
- 폰트 파일·웹폰트 **추가 없음**. 기존 `styles.sub` 시스템 글자만.
- npm 추가 없음.
- GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play

| 항목 | 결과 |
|------|------|
| 데이터 | `joinSendWay`는 앱 설정 JSON만. NCP 업로드 메타에 넣지 않음 |
| 권한 | 추가 없음 |
| 네트워크 | 추가 없음 |
| Data safety | 신규 수집 없음. 기기 안 전송 기록 |
| Play | 스토어 권한·데이터 유형 변경 없음 |

## 특허
- 특허 비침해를 보장하지 않음.
- GitHub 코드 검색: `joinSendWay`·`joinSendWayLabel`은 이 프로젝트 식별자.
- 목록 행에 출처 글자를 붙이는 구성은 일반 관용일 수 있음. 별도 청구항 대조가 필요하면 법무에서 검토.

## 롤백
`restore-sent-way-label.bat`

## 배포
- APK: `VoiceStamp_20260816_171905.apk` (`cd575ce`)
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260816_171905.apk
