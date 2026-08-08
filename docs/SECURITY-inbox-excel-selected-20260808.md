# 보안·라이선스·특허 점검 — 수신함 선택 엑셀 (2026-08-08)

## 변경 요약
- 사업 수신 목록에서 선택한 항목 중 **내 폰으로 가져온(가져옴)** 스탬프만 기존 XLSX 내보내기로 공유.
- 아직 서버에만 있는 항목은 제외하고 안내. 신규 npm·네트워크 API 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-inbox-excel-selected.bat`, 본 문서 |
| **재사용** | `loadStampXlsxExport` · `createStampsXlsx` · `shareStampsXlsx` · `listStamps` |
| **스냅샷** | `src.pre-inbox-excel-selected/`, `public.pre-inbox-excel-selected/` |

## 글꼴·의존성·GPL
- 폰트·npm 추가 없음. 기존 exceljs 경로 재사용.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 데이터 | 기기 로컬 스탬프만 파일로 공유. PIN·참여코드 미포함 |
| 권한 | 기존 공유 시트와 동일 |
| Data safety | 신규 수집 없음 |

## 특허
- 특허 비침해 보장하지 않음. 선택 항목 스프레드시트 내보내기는 일반 패턴일 수 있음.

## 롤백
`restore-inbox-excel-selected.bat`
