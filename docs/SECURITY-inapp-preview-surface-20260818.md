# 보안·라이선스·특허 점검 — 앱 내 미리보기 표면 표시 (2026-08-18)

## 변경 요약
- 앱 내 미리보기가 검정만 보이던 문제를 고친다. 촬영 JPEG는 그대로 나왔음.
- 미리보기 칸의 잘림(`overflow: hidden`)과 `absoluteFill`을 빼고, 칸 크기를 잰 뒤에 `CameraView`를 `flex: 1`로 붙인다.
- 세로 3:4 여백·4:3 JPEG 선택은 유지. **촬영 후 자르기 없음.**

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-inapp-preview-surface.bat`, 본 문서 |
| **재사용·수정** | `src/components/InAppCameraPreview.tsx`, `RESTORE.md` |
| **재사용(무수정)** | `cameraPictureSize.ts`, `CameraScreen.tsx`, `public/help.html`, `expo-camera` ~56.0.7 |
| **스냅샷** | `src.pre-inapp-preview-surface/` |
| **미사용** | 캡처 크롭, 신규 npm |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴. 프로젝트에 OFL 번들 없음.

## 의존성·GPL
- npm/Gradle 추가 없음. `expo-camera` MIT. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 카메라 | 미리보기 표시만. 권한·네트워크 변경 없음 |
| 수집 | 신규 없음 |
| Play | 데이터 유형 변경 없음 |

## 저작권·독자성
- 자체 레이아웃 수정. 외부 카메라 앱 예제 복사 없음.
- 식별자 `inapp-preview-surface`는 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 미리보기 칸 크기·여백은 일반 UX 수준일 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-inapp-preview-surface.bat`  
(3:4 맞춤 자체 되돌리기: `restore-inapp-preview-fit.bat`)

## 배포
- APK: `VoiceStamp_20260818_105424.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260818_105424.apk
