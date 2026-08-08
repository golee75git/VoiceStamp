# 보안·라이선스·특허 점검 — 참여 사업 이력 (2026-08-08)

## 변경 요약
- 촬영자 참여 연결을 **로컬 이력 JSON**(최대 20)에 보관. 활성 연결은 기존처럼 1개.
- 「연결 끊기」는 활성만 해제하고 **이력은 유지**. 「다시 연결」「목록에서 빼기」제공.
- npm·새 권한·서버 API 추가 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `projectCollectSettings.ts`, `ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-join-history.bat`, 본 문서 |
| **재사용** | `setProjectJoin` / `clearProjectJoin` / `listOwnedProjects` 패턴 |
| **스냅샷** | `src.pre-join-history/`, `public.pre-join-history/` |

## 글꼴·의존성·GPL
- 폰트·패키지 추가 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 데이터 | 기기 `app_settings`만. 참여코드·구분표시가 로컬 이력에 남음(서버로 추가 전송 없음) |
| 연결 끊기 | 업로드 중지. 이력 UI에서 수동 제거 가능 |
| Data safety | 신규 수집·권한 없음 |

## 특허
- 특허 비침해 보장하지 않음. 로컬 연결 이력·재연결은 일반 UX 패턴일 수 있음.

## 롤백
`restore-join-history.bat`
