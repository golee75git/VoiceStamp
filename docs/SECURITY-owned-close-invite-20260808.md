# 보안·라이선스·특허 점검 — 초대 라벨·목록 종료·종료됨 유지 (2026-08-08)

## 변경 요약
- 만든 사업 목록 「QR」→「초대」, 「종료」를 목록으로 이동(초대 화면에서 제거).
- 종료 시 로컬 삭제 대신 `closedAt` 기록. **만료일(`expiresAt`)까지 「종료됨」**으로 표시, 수신·엑셀 유지.
- 만료된 사업만 목록·PIN에서 정리. npm 추가 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `projectCollectSettings.ts`, `ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-owned-close-invite.bat`, 본 문서 |
| **재사용** | `apiCloseProject`, `upsertOwnedProject` |
| **스냅샷** | `src.pre-owned-close-invite/`, `public.pre-owned-close-invite/` |

## 글꼴·의존성·GPL
- 추가 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 종료 | 기존과 같이 서버 close + 로컬 표시. PIN은 만료까지 보관(수신용) |
| UI | 종료 확인 다이얼로그 유지 |
| Data safety | 신규 수집 없음 |

## 특허
- 특허 비침해 보장하지 않음. 종료 상태 뱃지·목록 유지는 일반 UX 패턴일 수 있음.

## 롤백
`restore-owned-close-invite.bat`
