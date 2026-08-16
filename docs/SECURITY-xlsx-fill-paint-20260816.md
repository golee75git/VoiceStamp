# SECURITY — 엑셀 막대 표시·만든 사업 엑셀 제거 (2026-08-16)

## 변경 요약
- 수신함 「엑셀 만들기」를 누르는 순간에 가로 막대(`엑셀 만드는 중 n / 전체`)를 켠다. `exceljs` 로드 뒤에 켜면 원형만 남던 문제를 막는다.
- 장마다 화면이 한 번 그려지도록 `yieldXlsxRowPaint`로 양보한다.
- 만든 사업 행의 엑셀 단추를 뺀다. 엑셀은 수신함 하단만 쓴다.
- 신규 npm·권한·네트워크 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `exportXlsx.ts`, `ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md`, `docs/README.md` |
| **신규** | `restore-xlsx-fill-paint.bat`, 본 문서 |
| **재사용** | `xlsxFill`, `onRowFill`, `XLSX_ROW_FILL_MIN`, `loadStampXlsxExport`, 가져오기 진행 박스 스타일 |
| **스냅샷** | `src.pre-xlsx-fill-paint/`, `public.pre-xlsx-fill-paint/` |

## 글꼴·의존성·GPL
- 폰트 파일·웹폰트 **추가 없음**. 시스템 UI 글꼴만.
- npm 추가 없음. 기존 exceljs는 버튼 시에만 `import()` (번들 C 유지).
- GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play

| 항목 | 결과 |
|------|------|
| 데이터 | 장수 카운터만 화면 메모리. 사진 바이트·PIN을 새로 보내지 않음 |
| 권한 | 추가 없음 |
| 네트워크 | 추가 없음 |
| Data safety | 신규 수집 없음 |
| Play | UI 안내·단추 배치만. 스토어 권한 변경 없음 |

## 특허
- 특허 비침해를 보장하지 않음.
- GitHub 코드 검색: `yieldXlsxRowPaint`는 이 프로젝트 식별자이며 공개 저장소 동일 구현으로 확인되지 않음.
- 장수 진행 막대·허브 단추 제거는 일반 UI 관용일 수 있음. 별도 청구항 대조가 필요하면 법무에서 검토.

## 롤백
`restore-xlsx-fill-paint.bat`

## 배포
- APK: `VoiceStamp_20260816_150607.apk` (`8335301`)
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260816_150607.apk
