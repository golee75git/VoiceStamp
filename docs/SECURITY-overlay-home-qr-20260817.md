# 보안·라이선스·특허 점검 — 기관 홈 QR (JPEG·PDF) (2026-08-17)

## 변경 요약
- 설정에 기관 홈페이지 http(s) 한 주소와 표시/숨김(기본 숨김)을 둔다.
- JPEG·PDF QR 주소: 사진 `sourceUrl`이 유효하면 그것, 아니면 설정 홈(표시일 때).
- 우하단 QR 하나. 표시 그림(왼쪽)과 겹치지 않음.
- 저장 화면 QR 칸을 기관 홈으로 채우지 않음. 한글·엑셀 없음.
- 신규 npm 없음. 기존 `qrcode` MIT·자체 PNG 생성 재사용.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `src/services/overlayHomeQr.ts`, `restore-overlay-home-qr.bat`, 본 문서 |
| **재사용·수정** | `settingsService.ts`, `overlayText.ts`, `qrCodeService.ts`, `renderStampCaptionNative.ts`, `renderStampWatermarkNative.ts`, `exportPdf.ts`, `exportStampImage.ts`, `SettingsScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **재사용(무수정)** | `qrUrlExtractService.ts` `normalizeHttpUrl`, `qrcode` MIT |
| **스냅샷** | `src.pre-overlay-home-qr/`, `public.pre-overlay-home-qr/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만.

## 의존성·GPL
- npm/Gradle 추가 없음.
- `qrcode` MIT. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| URL | `normalizeHttpUrl`만. http(s), 자격 증명 거부 |
| 저장 | `app_settings` 로컬만. 앱이 홈페이지를 가져오지 않음 |
| QR | 픽셀만 합성. 탭으로 열지 않음 |
| 권한 | 신규 없음 |
| Data safety | 신규 수집·서버 전송 없음 |
| Play | 스토어 권한·데이터 유형 변경 없음 |

## 저작권·독자성
- 기존 사진 QR 합성과 설정 오버레이 칸을 이어서 쓴 것. 외부 QR 위젯 예제 복사 없음.
- 식별자 `overlayHomeQr`·`overlay_home_url`·`overlay_show_home_qr`·`resolveComposeQrUrl`은 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 문서·사진에 URL QR을 넣는 구성은 일반 내보내기 UX 수준.
- QR 특허는 만료된 것으로 기존 `qrCodeService` 주석과 같음. 청구항 대비 보장하지 않음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-overlay-home-qr.bat`

## 배포
- APK: (빌드 후 기입)
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/
