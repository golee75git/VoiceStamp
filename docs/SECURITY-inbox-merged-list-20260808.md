# 보안·라이선스·특허 점검 — 수신함 병합 목록 (2026-08-08)

## 변경 요약
- 사업 수신함에서 서버 manifest와 로컬 「내 폰으로」가져오기 결과를 한 목록으로 병합.
- 로컬 썸네일·미리보기·휴지통을 수신함에 통합. 별도 「가져옴」화면·버튼 제거.
- 서버에서 삭제된 뒤에도 로컬에 있으면 「가져옴」·「폰에만 있음」으로 목록에 유지.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `ProjectCollectScreen.tsx`, `projectImportedStamps.ts`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-inbox-merged-list.bat`, 본 문서 |
| **재사용** | `listImportedStampsForProject`, `StampListThumb`, `moveStampsToTrash`, `apiManifest` |
| **유지(미연결)** | `ProjectImportedList.tsx` (롤백·참조용, 수신 UI에서 제거) |
| **스냅샷** | `src.pre-inbox-merged-list/`, `public.pre-inbox-merged-list/` |

## 글꼴·의존성·GPL
- 폰트·npm 추가 없음. GPL 신규 도입 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 데이터 | 서버 manifest + 기기 로컬 스탬프만. 새 권한·수집 없음 |
| PIN | 기존과 동일하게 수신/다운로드에만 사용. UI에 표시하지 않음 |
| Data safety | 신규 네트워크/수집 경로 없음 |

## 특허
- 특허 비침해 보장하지 않음. 목록 병합·썸네일 표시는 일반 UI 패턴일 수 있음.

## 롤백
`restore-inbox-merged-list.bat`
