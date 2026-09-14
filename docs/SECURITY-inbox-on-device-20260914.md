# 보안·라이선스·특허 점검 — 수신함 이 폰 사진 표시 (2026-09-14)

## 변경 요약
- 사업 수신 목록에서 서버 줄과 **이 폰 저장 목록의 같은 ID**가 있으면 대기 칸 대신 그 사진을 보여 준다.
- 「내 폰으로」받은 장은 **가져옴**, 저장 목록 원본은 **이 폰**. 다른 기기 장이고 아직 없으면 **대기** 유지.
- 사진 경로가 붙으면 기존 수신 엑셀이 고른 장을 넣을 수 있다.
- 신규 npm·권한·네트워크 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **신규** | `restore-inbox-on-device.bat`, 본 문서 |
| **수정** | `src/services/projectImportedStamps.ts`, `src/components/ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md`, `docs/README.md` |
| **재사용** | `listImportedStampsForProject`, `listStamps`, 수신 엑셀(`localImagePath`) |
| **스냅샷** | `src.pre-inbox-on-device/`, `public.pre-inbox-on-device/` |

## 글꼴·의존성·GPL
- 폰트 파일·웹폰트 **추가 없음**. 앱은 시스템 글꼴.
- npm 추가 없음. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play

| 항목 | 결과 |
|------|------|
| 데이터 | 이 기기 SQLite 스탬프와 수신 manifest ID만 맞춤. PIN·업로드 경로 변경 없음 |
| 권한 | 추가 없음 |
| 네트워크 | 추가 호출 없음 |
| 휴지통 | 이 폰 표시 줄도 경로가 있어 수신함 휴지통이 저장 목록 원본을 옮길 수 있음(고른 뒤에만) |
| Data safety | 신규 수집 없음 |
| Play | 권한 선언 변경 없음 |

## 특허
- 특허 비침해를 보장하지 않음.
- 같은 ID로 목록을 붙이는 구성은 일반 앱 패턴일 수 있음. 청구항 대조가 필요하면 법무에서 검토.
- GitHub 코드 검색: `InboxLocalKind`·`onDeviceBadge`·`on_device` 수신 배지는 이 프로젝트 식별자.

## 롤백
`restore-inbox-on-device.bat`

## 배포
- APK: `VoiceStamp_20260914_230623.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260914_230623.apk
