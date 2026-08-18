# 보안·라이선스·특허 점검 — 앱 내 셔터 시 미리보기 유지 (2026-08-18)

## 변경 요약
- 셔터를 눌러도 QR 감지를 끄지 않아 카메라가 다시 붙지 않게 한다. 찍는 중·잠긴 뒤의 QR 콜백만 무시한다.
- 3:4 미리보기 칸을 **위쪽에 붙이고** 여백은 아래만 둔다.
- 촬영 후 JPEG 자르기 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-inapp-shutter-keep.bat`, 본 문서 |
| **재사용·수정** | `src/components/CameraScreen.tsx`, `src/components/InAppCameraPreview.tsx`, `public/help.html`, `RESTORE.md` |
| **재사용(무수정)** | `cameraPictureSize.ts`, `expo-camera` ~56.0.7 |
| **스냅샷** | `src.pre-inapp-shutter-keep/`, `public.pre-inapp-shutter-keep/` |
| **미사용** | 캡처 크롭, 신규 npm |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI. 프로젝트에 OFL 번들 없음.

## 의존성·GPL
- npm/Gradle 추가 없음. `expo-camera` MIT. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| QR | 미리보기 감지는 유지. 촬영 중·잠긴 뒤에는 주소를 바꾸지 않음. 누르기 전 열기 없음 |
| 카메라 | 권한·네트워크 변경 없음 |
| Play | 데이터 유형 변경 없음 |

## 저작권·독자성
- 자체 셔터·레이아웃 수정. 외부 카메라 앱 예제 복사 없음.
- 식별자 `inapp-shutter-keep`는 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 미리보기 위쪽 배치·촬영 중 감지 유지는 일반 UX 수준일 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-inapp-shutter-keep.bat`

## 배포
- APK: `VoiceStamp_20260818_112120.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260818_112120.apk
