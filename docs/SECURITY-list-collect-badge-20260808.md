# 보안·라이선스·특허 점검 — 저장 목록 취합 배지 (2026-08-08)

## 변경 요약
- 저장 목록 카드에 업로드 상태 배지: **취합**(`synced`) / **취합 실패**(`failed`).
- 기존 `getUploadStatusMap()`만 사용. DB·API·신규 npm 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `StampListScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-list-collect-badge.bat`, 본 문서 |
| **재사용** | `projectCollectSettings.getUploadStatusMap` |
| **스냅샷** | `src.pre-list-collect-badge/`, `public.pre-list-collect-badge/` |

## 글꼴·의존성·GPL
- 폰트·패키지 추가 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 데이터 | 기기 로컬 설정 맵만 읽음. 네트워크·새 권한 없음 |
| 표시 | UI 라벨만. PIN·참여코드 노출 없음 |
| Data safety | 신규 수집 없음 |

## 특허
- 특허 비침해 보장하지 않음. 목록 상태 배지는 일반 UI 패턴일 수 있음.

## 롤백
`restore-list-collect-badge.bat`
