# 보안·라이선스·특허 점검 — 사업 목록 관리 (2026-08-08)

## 변경 요약
- 허브가 `owned[0]`만 쓰지 않고 **만든 사업 목록**을 표시합니다.
- 사업별 **QR / 수신 / 엑셀** 버튼. 새 만들기는 기존과 같이 `upsertOwnedProject`(최대 20, 기존 유지).
- 저장·API·서버 스키마 변경 없음.
- **신규 npm 없음.**

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-owned-project-list.bat`, 본 문서 |
| **재사용** | `listOwnedProjects` / `upsertOwnedProject` |
| **스냅샷** | `src.pre-owned-project-list/`, `public.pre-owned-project-list/` |

## 글꼴·의존성·GPL
- 폰트·패키지 추가 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 저장 | 기존 로컬 `project_owned_json` 상한 20 유지 |
| PIN | 사업별 `project_pin_*` 기존과 동일. 목록에 PIN 표시 없음 |
| Data safety | 신규 클라우드/권한 없음. UI만 변경 |

## 특허
- 특허 비침해 보장하지 않음. 로컬 목록 UI는 일반 패턴일 수 있음.

## 롤백
`restore-owned-project-list.bat`
