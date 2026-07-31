# 보안·라이선스 점검 — 랜딩 웹테스트 링크 (2026-07-31)

## 변경 범위
- `public/landing.html`: APK 파일명 아래 same-origin `/app` 링크(큰 글씨)
- `public/help.html`: 홈에서 웹테스트 진입 안내 문구

## 취약점·보안
| 항목 | 결과 |
|------|------|
| 외부 URL/스크립트 추가 | 없음 (`href="/app"` same-origin) |
| XSS/인라인 스크립트 | 없음 (정적 앵커+CSS만) |
| 권한·네트워크·의존성 | 변경 없음 |
| open redirect | 해당 없음 |

## 저작권·독자성
- 랜딩 CTA 배치·타이포 조정만. 제3자 SDK/특허 API 미사용.

## 라이선스·의존성
- 신규 npm/Gradle 패키지 **없음** → OSS 목록 재생성 불필요.

## Play Store
- 웹 랜딩만 변경. APK·권한·Data safety 영향 없음. 스토어 리스팅과 무관.

## 롤백
`restore-landing-web-test-link.bat`
