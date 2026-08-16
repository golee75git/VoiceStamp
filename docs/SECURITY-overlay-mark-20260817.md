# 보안·라이선스·특허 점검 — 표시 그림 JPEG 합성 (2026-08-17)

## 변경 요약
- 설정에서 앨범 그림 한 장을 고르면 앱 문서 폴더 `overlay/mark.jpg`에만 복사한다(긴 변 256, JPEG).
- 캡션 JPEG·워터마크 JPEG 합성 시에만 붙인다. PDF·한글·엑셀·웹 합성은 그대로 둔다.
- 표시/숨김은 `app_settings`의 `overlay_show_mark`다. 경로는 DB에 넣지 않고 고정 파일만 쓴다.
- 주소(http/https/data)로 그림을 받지 않는다. 신규 npm 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `src/services/overlayMark.ts`, `restore-overlay-mark.bat`, 본 문서 |
| **재사용·수정** | `settingsService.ts`, `overlayText.ts`, `renderStampCaptionNative.ts`, `renderStampWatermarkNative.ts`, `SettingsScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **재사용(무수정)** | `expo-image-picker` MIT, `expo-image-manipulator` MIT, `react-native-image-marker` MIT, `qrCodeService.ts` |
| **스냅샷** | `src.pre-overlay-mark/`, `public.pre-overlay-mark/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만.
- 프로젝트 `.ttf`/`.otf` 번들 없음.

## 의존성·GPL
- npm/Gradle 추가 없음.
- 기존 패키지만 재사용. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)
- dual-license 기존 확정: jszip MIT, node-forge BSD-3-Clause.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 출처 | 앨범 피커의 로컬 URI만. http(s)·data URI 거부 |
| 저장 | `documentDirectory/overlay/mark.jpg` 고정. 사용자 경로 문자열 없음 |
| 용량 | 원본 8MB 초과 거부. 복사 전 긴 변 256 JPEG로 축소 |
| 권한 | 기존 앨범 권한만. 새 권한 없음 |
| 네트워크 | 표시 그림을 서버로 올리지 않음. 갤러리 JPEG에 픽셀로 들어가면 그 파일과 함께 공유될 수 있음 |
| EXIF | 피커에서 EXIF를 읽지 않음. 축소 JPEG로 다시 저장 |
| Data safety | 신규 수집 유형 없음. 사용자가 고른 그림을 기기에만 보관 |
| Play | 스토어 권한·데이터 유형 변경 없음. 쓸 권한이 있는 그림만 고르라는 안내 |

## 저작권·독자성
- 기존 기관명 설정·QR `markImage` 합성을 이어서 쓴 것. 외부 워터마크 앱·SDK 예제 복사 없음.
- 식별자 `overlayMark`·`overlay_show_mark`·`OVERLAY_MARK_REL`은 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 사진 JPEG에 기관 표시 그림을 겹치는 구성은 일반 내보내기 UX 수준.
- 기존 `react-native-image-marker` 이미지 워터마크와 같은 계열이며, 청구항 대비 보장하지 않음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-overlay-mark.bat`

앱 문서 폴더의 `overlay/mark.jpg`는 코드 롤백과 별개로 기기에 남을 수 있다. 설정에서 「지우기」로 지운다.

## 배포
- APK: `VoiceStamp_20260817_074537.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260817_074537.apk
