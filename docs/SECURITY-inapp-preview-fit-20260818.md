# 보안·라이선스·특허 점검 — 앱 내 미리보기 비율 맞춤 (2026-08-18)

## 변경 요약
- 앱 내 카메라 미리보기를 **전체 화면 FILL** 대신 **세로 3:4 칸**에 두고, 나머지 화면은 검정 여백으로 둔다.
- 촬영 JPEG는 **4:3 / 3:4 크기**를 우선 고른다(긴 변 2560 한도는 가능한 한 유지).
- 셔터 축소 애니메이션은 끈다(`animateShutter={false}`). Android만 `ratio="4:3"`(이미 쓰는 expo-camera prop).
- **촬영 후 JPEG를 잘라 맞추지 않는다.** 2026-07-23 FILL 크롭과 다른 경로.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-inapp-preview-fit.bat`, 본 문서 |
| **재사용·수정** | `src/components/InAppCameraPreview.tsx`, `src/utils/cameraPictureSize.ts`, `public/help.html`, `RESTORE.md` |
| **재사용(무수정)** | `CameraScreen.tsx` 셔터·저장 흐름, `StampSavePreview` `contain`, `expo-camera` ~56.0.7 |
| **스냅샷** | `src.pre-inapp-preview-fit/`, `public.pre-inapp-preview-fit/` |
| **미사용** | `stampImageCrop.ts` 캡처 크롭, 신규 npm |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 앱 UI는 기존 시스템 글꼴. 프로젝트에 OFL 번들 `.ttf`/`.otf` 없음.

## 의존성·GPL
- npm/Gradle **추가 없음**. `expo-camera` 56.0.7 **MIT**(이미 사용).
- jszip MIT 경로·node-forge BSD 경로 유지. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 카메라 | 미리보기 배치·pictureSize 선택만. 권한 문자열 변경 없음 |
| 이미지 | 캡처 후 크롭·재인코딩 경로 추가 없음 |
| 수집 | 신규 없음 |
| Play | 데이터 유형·권한 변경 없음. 미리보기 여백은 UX |

## 저작권·독자성
- 자체 레이아웃(부모 칸에 3:4 맞춤)과 기존 `pickPreferredStampPictureSize` 확장.
- Expo 문서에 있는 prop 이름만 사용. 외부 카메라 앱·GitHub 예제 복사 없음.
- 식별자 `inapp-preview-fit`는 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 미리보기를 촬영 비율에 맞추고 여백을 두는 구성은 일반 카메라 UX 수준일 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-inapp-preview-fit.bat`

## 배포
- APK: `VoiceStamp_20260818_103007.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260818_103007.apk
