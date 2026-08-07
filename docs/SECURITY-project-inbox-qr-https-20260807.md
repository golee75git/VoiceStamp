# 보안·라이선스·특허 점검 — 수신 바·QR https (2026-08-07)

## 변경 요약
- 수신 목록 하단「전체·내 폰으로·엑셀」이 Android 시스템 내비에 가리지 않도록 `paddingBottom` 확대.
- 사업 QR·API `qrPayload`를 `voicestamp://` 대신 **https 참여 URL**로 변경 → 카메라 스캔 시 브라우저/`join.html`로 열림.
- 구형 `voicestamp://join` 문자열 붙여넣기 파싱은 유지.
- **신규 npm 없음.**

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `ProjectCollectScreen.tsx`, `api/project.js`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-project-inbox-qr-https.bat`, 본 문서 |
| **재사용** | `INFO_BASE_URL`, `public/join.html` |
| **스냅샷** | `src.pre-project-inbox-qr-https/`, `api.pre-project-inbox-qr-https/` |

## 글꼴·의존성
- 폰트·패키지 추가 없음. `qrcode` MIT.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| QR 내용 | uploadCode만 URL 쿼리에 포함(기존과 동일 수준). PIN 없음 |
| https | 공개 `join.html`은 코드 표시·안내만 |
| Data safety | 전송 경로 변경 없음 |

## 특허
- 특허 비침해 보장하지 않음. https QR·하단 inset은 일반 UI 패턴.

## 롤백
`restore-project-inbox-qr-https.bat` + API 변경 시 Vercel Redeploy
