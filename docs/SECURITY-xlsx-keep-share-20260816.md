# SECURITY — 엑셀 앱 폴더 저장 후 공유 (2026-08-16)

## 변경 요약
- Android에서 엑셀을 만든 뒤 캐시에만 두지 않고, 사진과 같은 현장 폴더(없으면 `exports/`)에 복사한 다음 공유 시트를 연다.
- 웹은 기존처럼 브라우저 다운로드. 신규 npm·권한·네트워크 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `exportXlsx.ts`, `StampListScreen.tsx`, `public/help.html`, `RESTORE.md`, `docs/README.md` |
| **신규** | `restore-xlsx-keep-share.bat`, 본 문서 |
| **재사용** | `ensureStampGroupDir`, `extractStampGroupFromImagePath`, `writeUint8ArrayToCacheFile`, `Sharing.shareAsync`, `loadStampXlsxExport` |
| **스냅샷** | `src.pre-xlsx-keep-share/`, `public.pre-xlsx-keep-share/` |

## 글꼴·의존성·GPL
- 폰트 파일·웹폰트 **추가 없음**.
- npm 추가 없음. exceljs는 버튼 시 `import()` 유지(번들 C).
- GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play

| 항목 | 결과 |
|------|------|
| 데이터 | 엑셀 복사본은 기존 앱 `documentDirectory`만. 서버·PIN·사진을 새로 보내지 않음 |
| 권한 | 추가 없음 (Downloads/MediaStore 미사용) |
| 네트워크 | 추가 없음 |
| Data safety | 신규 수집 없음. 공유 시트는 사용자가 고른 앱으로만 전달 |
| Play | 저장 위치는 앱 전용 폴더. 스토어 권한 변경 없음 |

## 특허
- 특허 비침해를 보장하지 않음.
- GitHub 코드 검색: `keepXlsxOnDevice`·`pickXlsxKeepFolder`는 이 프로젝트 식별자이며 공개 저장소 동일 구현으로 확인되지 않음.
- 파일을 기기에 남긴 뒤 공유 시트를 여는 구성은 일반 관용일 수 있음. 별도 청구항 대조가 필요하면 법무에서 검토.

## 롤백
`restore-xlsx-keep-share.bat`

## 배포
- APK: `VoiceStamp_20260816_154152.apk` (`6bee948`)
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260816_154152.apk
