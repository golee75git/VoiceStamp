# 보안·라이선스·특허 점검 — 목록 「수신」배지 (2026-08-08)

## 변경 요약
- 수신함 → 내 폰으로 가져온 사진에 로컬 업로드 상태 `received`를 기록.
- 저장 목록에 **수신** 배지 표시. **전송**(`synced`) / **전송 실패**(`failed`)는 유지.
- `synced`·`pending`·`uploading` 상태일 때는 `received`로 덮지 않음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `projectCollectSettings.ts`, `projectImportService.ts`, `StampListScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-list-received-badge.bat`, 본 문서 |
| **재사용** | `getUploadStatusMap` / `setUploadStatus` |
| **스냅샷** | `src.pre-list-received-badge/`, `public.pre-list-received-badge/` |

## 글꼴·의존성·GPL
- 폰트·npm 패키지 추가 없음. GPL 신규 도입 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 데이터 | 기기 로컬 설정 맵만 갱신. 네트워크·새 권한 없음 |
| 표시 | UI 라벨만. PIN·참여코드 노출 없음 |
| Data safety | 신규 수집·전송 없음 |

## 특허
- 특허 비침해 보장하지 않음. 목록 상태 배지는 일반 UI 패턴일 수 있음. 별도 청구항 대비는 필요 시 법무 검토.

## 롤백
`restore-list-received-badge.bat`
