# SECURITY — 엑셀 5장 이상 가로 막대 (2026-08-16)

## 변경 요약
- 엑셀에 사진을 **5장 이상** 넣을 때 원형 대신 가로 막대와 「엑셀 만드는 중 n / 전체」를 보여 준다.
- 4장 이하는 기존 원형 유지.
- `createStampsXlsx`가 한 장을 넣을 때마다 화면이 다시 그려지도록만 알린다. 신규 npm·권한·네트워크 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `exportXlsx.ts`, `exportOnDemand.ts`, `ProjectCollectScreen.tsx`, `StampListScreen.tsx`, `public/help.html`, `RESTORE.md`, `docs/README.md` |
| **신규** | `restore-xlsx-row-fill.bat`, 본 문서 |
| **재사용** | `loadStampXlsxExport`, `createStampsXlsx`, 수신 가져오기 진행 박스 스타일, `Alert.alert` |
| **스냅샷** | `src.pre-xlsx-row-fill/`, `public.pre-xlsx-row-fill/` |

## 글꼴·의존성·GPL
- 폰트 파일·웹폰트 **추가 없음**. 시스템 UI 글꼴만.
- 프로젝트 `.ttf`/`.otf` 번들 없음. 기존 OFL 자산 변경 없음.
- npm 추가 없음. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play

| 항목 | 결과 |
|------|------|
| 데이터 | 장수 카운터만 화면 메모리. 사진 바이트·PIN을 새로 보내지 않음 |
| 권한 | 추가 없음 |
| 네트워크 | 추가 없음 |
| Data safety | 신규 수집 없음 |
| Play | UI 안내만. 스토어 권한 변경 없음 |

## 특허
- GitHub 코드 검색: `onRowFill`은 ExcelJS API가 아니며 이 프로젝트 콜백 이름이다. 동일 구현으로 확인되지 않음.
- 장수에 따라 원형/막대를 고르는 구성은 일반 UI 관용일 수 있음. 별도 청구항 대조가 필요하면 법무에서 검토.

## 롤백
`restore-xlsx-row-fill.bat`

## 배포
- APK: `VoiceStamp_20260816_141835.apk` (`d521763`)
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260816_141835.apk
