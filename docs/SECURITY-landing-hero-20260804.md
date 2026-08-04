# 보안·라이선스 점검 — 랜딩 히어로 (2026-08-04)

## 변경 요약
홈 랜딩에 자체 생성 히어로 PNG와 섹션 카피를 반영. 기능 스크립트(QR·공유·visitor)는 재사용.

## 취약점·보안
| 항목 | 결과 |
|------|------|
| XSS | 사용자 입력을 DOM에 삽입하지 않음. visitor 숫자는 `textContent`만 사용(기존) |
| 외부 리소스 | 새 CDN·원격 폰트·원격 이미지 없음. `img-src 'self'` CSP와 일치 |
| 다운로드 링크 | 기존 GitHub raw APK URL 유지 |
| 클릭재킹 | 기존 `X-Frame-Options: DENY` 유지 |
| 개인정보 | 서버에 사진·위치 저장 안 함 안내 유지. 신규 수집 필드 없음 |

## 라이선스·GPL
- **신규 npm 패키지 없음**
- 기존 `jszip` 등 dual MIT/GPL 의존성은 변경 없음(앱 측 MIT 경로 사용 관행 유지)
- 히어로 PNG: 본 작업에서 새로 생성한 독자 시각 자산(외부 제품 UI 복제 아님)

## 글꼴
- HTML: OS `system-ui` 계열만 사용
- 프로젝트 앱 도움말 기준: 별도 폰트 파일 없음 → OFL 번들 추가 없음
- 이미지에 글자 미포함

## 파일 구분
### 새로 작성
- `public/hero-banner-wide.png`
- `public/hero-banner-tall.png`
- `public/hero-product.png`
- `assets/hero-banner-wide.png` (동일 사본)
- `assets/hero-banner-tall.png`
- `assets/hero-product.png`
- `restore-landing-hero.bat`
- `public.pre-landing-hero/` (스냅샷)
- `docs/DESIGN-landing-hero-20260804.md`
- `docs/SECURITY-landing-hero-20260804.md`

### 변경(재사용 기반)
- `public/landing.html`
- `public/help.html`
- `RESTORE.md` (§221)

## 검증 (2026-08-04)
| 항목 | 결과 |
|------|------|
| Git diff | `landing.html`·`help.html`만 기존 추적 파일 변경. PNG·docs·restore 신규 |
| GitHub 코드 검색 | `gh` 미인증으로 검색 불가. 랜딩은 기존 자체 HTML/스크립트 재배치 + 신규 생성 PNG |
| license-checker | 신규 패키지 없음. 기존 tree: MIT 다수, `(MIT OR GPL-3.0-or-later)` 1건은 기존 jszip 계열(dual) — 본 변경으로 추가되지 않음 |
| 특허 대비 | 정적 시각·카피만. 신규 기술 구성 없음 |

## 되돌리기
`restore-landing-hero.bat` 실행 → `landing.html`·`help.html` 복구. PNG는 수동 삭제.
