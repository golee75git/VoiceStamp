# 보안·라이선스·특허 점검 — 사업 참여 구분 표시 필수 (2026-08-08)

## 변경 요약
- 코드 참여·QR 참여 모두 **구분 표시 필수**(1~40자, `sanitizeJoinMark`).
- QR 인식 후 표시가 없으면 참여 Alert로 바로 가지 않고, 참여 화면에서 입력·「연결」을 유도.
- 참여 확인 Alert에 입력한 구분 표시를 함께 보여 줌.
- **신규 npm 없음.**

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-join-mark-required.bat`, 본 문서 |
| **재사용** | 기존 `sanitizeJoinMark` / `uploadedByMark` 경로 |
| **스냅샷** | `src.pre-join-mark-required/`, `public.pre-join-mark-required/` |

## 글꼴·의존성·GPL
- 폰트·패키지 추가 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 입력 | 기존과 동일 trim·40자. 서버는 기존 `uploadedByMark` 절단 유지 |
| 필수성 | 앱 검증만. 본인확인·인증 수단 아님 |
| 개인정보 | 사용자가 적는 짧은 표시(별칭 등)가 사업 TTL 동안 일시 저장소에 남을 수 있음. 전화 전체·실명 강제 없음 |
| Data safety | 신규 권한·신규 전송 채널 없음 |

## 특허
- 특허 비침해 보장하지 않음. 참여 전 필수 표시 입력은 일반 폼 검증 패턴일 수 있음.

## 롤백
`restore-join-mark-required.bat`
