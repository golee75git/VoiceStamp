# 보안·라이선스·특허 점검 — 워터마크 JPEG QR (2026-08-05)

## 변경 요약
- 워터마크 저장/내보내기 JPEG에도 확인된 http(s) `sourceUrl` QR을 합성
- 기존 caption QR 경로(`qrCodeService` / `normalizeHttpUrl`) 재사용
- QR은 글자 바 **위** 우하단에 배치(바·글자와 겹침 완화)
- 신규 네트워크·권한·패키지 없음

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-watermark-qr.bat`, 본 문서 |
| **재사용·수정** | `renderStampWatermarkNative.ts`, `exportStampImage.ts`, `StampSaveModal.tsx`, `SettingsScreen.tsx`, `settingsService.ts`, `qrCodeService.ts`, `stamp.ts`, `public/help.html`, `RESTORE.md` |
| **스냅샷** | `src.pre-watermark-qr/`, `public.pre-watermark-qr/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만.

## 의존성·GPL
- 신규 npm/Gradle 없음. 기존 MIT `qrcode`(매트릭스만) 재사용.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 권한 | 변경 없음 |
| 네트워크 | QR 생성 시 URL을 열거나 fetch하지 않음(기존과 동일). 연결확인은 기존 opt-in 버튼 |
| 입력 | `normalizeHttpUrl`로 http(s)만 허용 |
| Data safety | 기존과 동일 |

## 저작권·독자성
- VoiceStamp 기존 caption QR 합성 패턴을 워터마크 경로에만 확장. 외부 구현 복사 없음.

## 특허 검토 메모 (보장 아님)
- QR 자체 관련 핵심 특허는 만료된 것으로 알려져 있음(보장 아님).
- 이미지 위 오버레이 배치는 일반 UX 수준.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-watermark-qr.bat`

## 도움말
- `public/help.html` 사진 URL → QR 항목을 워터마크 포함으로 갱신.
