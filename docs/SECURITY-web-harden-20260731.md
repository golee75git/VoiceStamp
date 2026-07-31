# 보안 점검 후속 — 웹 최소  hardening (2026-07-31)

## 변경
1. `vercel.json` — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, 호환 CSP (`unsafe-inline`/`unsafe-eval`은 Expo `/app`용)
2. `api/visitor.js` — POST: Origin/Referer 허용 목록 + IP당 분당 20회(인스턴스 로컬)
3. `public/report.html` — `imageFile` basename 화이트리스트 (`A-Za-z0-9._-`)

## 미변경
- 카카오 키: 콘솔 도메인 제한은 운영 설정 (코드 변경 없음)
- APK / 앱 네이티브 로직

## 롤백
`restore-web-security-harden.bat`
