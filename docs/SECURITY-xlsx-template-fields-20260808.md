# 보안·라이선스·특허 점검 — 엑셀 템플릿 칸·취합 필드 전달 (2026-08-08)

## 변경 요약
- 엑셀에 저장 템플릿 칸 이름(제목·장소·메모·추가1~3)·저장 유형 열 추가(목록·수신 공통).
- 취합 올리기 meta·가져오기에 extra·필드 라벨 전달. npm 추가 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `exportXlsx.ts`, `projectUploadQueue.ts`, `projectImportService.ts`, `api/project.js`, `help.html`, `RESTORE.md` |
| **신규** | `restore-xlsx-template-fields.bat`, 본 문서 |
| **재사용** | `resolveFieldLabels`, `listStampFieldTemplatesForFilter`, createStampsXlsx 호출부 |
| **스냅샷** | `src.pre-xlsx-template-fields/`, `api.pre-xlsx-template-fields/`, `public.pre-xlsx-template-fields/` |

## 글꼴·의존성·GPL
- 추가 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| meta | 길이 sanitize (라벨 20, extra 500). 비밀 없음 |
| 엑셀 | 로컬/공유만. 신규 수집 없음 |

## 특허
- 특허 비침해 보장하지 않음. 스프레드시트 열 추가는 일반 내보내기 패턴일 수 있음.

## 롤백
`restore-xlsx-template-fields.bat`
