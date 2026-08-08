# 보안·라이선스·특허 점검 — 전송 배지·수신 가져옴 (2026-08-08)

## 변경 요약
1. 저장 목록 배지 문구: **전송** / **전송 실패** (`synced` / `failed`).
2. 수신 목록: 로컬에 동일 stampId가 있고 휴지통이 아니면 **가져옴** 표시 (`getStampById`).
3. **신규 npm 없음.** API·스키마 변경 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `StampListScreen.tsx`, `ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-transmit-inbox-mark.bat`, 본 문서 |
| **재사용** | `getUploadStatusMap`, `getStampById` |
| **스냅샷** | `src.pre-transmit-inbox-mark/`, `public.pre-transmit-inbox-mark/` |

## 글꼴·의존성·GPL
- 폰트·패키지 추가 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 표시 | 로컬 DB·설정 맵만 조회. 네트워크 추가 호출 없음 |
| PIN | 수신 목록·가져오기 권한 경로 변경 없음 |
| Data safety | 신규 수집 없음 |

## 특허
- 특허 비침해 보장하지 않음. 상태 라벨 UI는 일반 패턴일 수 있음.

## 롤백
`restore-transmit-inbox-mark.bat`
