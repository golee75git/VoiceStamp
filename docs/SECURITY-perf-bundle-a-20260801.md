# 보안·라이선스·특허 점검 — 성능 번들 A (2026-08-01)

## 변경 요약
- 촬영 JPEG 품질·긴 변 상한 (`captureImageBudget`, `pickPreferredStampPictureSize`)
- 갤러리 백업을 UI 유휴 후 **직렬** 큐로 실행 (`gallerySaveIdleQueue`)
- 신규 설치 기본 갤러리 모드: `app_only` (기존에 저장된 설정 값은 유지)

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `src/constants/captureImageBudget.ts`, `src/services/gallerySaveIdleQueue.ts`, `restore-perf-bundle-a.bat`, 본 문서 |
| **재사용·수정** | `CameraScreen.tsx`, `pickStampImage.ts`, `cameraPictureSize.ts`, `saveStamp.ts`, `settingsService.ts`, `SettingsScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-perf-bundle-a/`, `public.pre-perf-bundle-a/` |

## 글꼴 (OFL)
- 이번 변경에서 **폰트 파일 추가 없음**. UI는 기존과 같이 **시스템 글꼴**만 사용.
- Android 시스템 글꼴(예: Roboto / Noto 계열)은 기기 벤더 배포분이며, 앱이 OFL 폰트 파일을 번들하지 않음.
- 도움말에도 「시스템 글꼴만」 명시.

## 의존성·GPL
- **신규 npm/Gradle 없음.**
- `license-checker --production --failOn 'GPL-3.0;GPL-2.0;…'` 통과(순수 GPL 강제 패키지 없음). 요약: MIT 다수, ISC/Apache/BSD 등. dual-license 표기는 관용적 MIT/BSD 선택 경로.
- 기존 패키지 재사용만 (expo-camera, expo-image-picker, React Native `InteractionManager`).
- GPL 라이선스 신규 도입 없음.

## GitHub 코드 검색
- 심볼 `enqueueGallerySaveIdle` / `STAMP_PICTURE_LONG_EDGE_MAX` / `pickPreferredStampPictureSize` — 로컬 CLI `gh` 미인증으로 원격 검색 불가. 명칭은 VoiceStamp 전용으로 신규 작성.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 권한 | 변경 없음 (카메라·저장소 기존과 동일) |
| 데이터 | 갤러리 백업 시점만 유휴·직렬화. 앱 SQLite 저장은 기존처럼 즉시 |
| Data safety | 수집 항목 변화 없음 |
| 기본 `app_only` | 신규 설치만 해당. 사용자 선택으로 갤러리 모드 복구 가능 |

## 저작권·독자성
- VoiceStamp 기존 `saveStamp` / 카메라 경로에 품질 상수·직렬 큐만 추가.
- 외부 GitHub·경쟁앱·특허 문서 구현을 복사·번역하지 않음.
- 일반 관용: JPEG quality 스칼라, InteractionManager 후속 작업, Promise 체인 큐.

## 특허 검토 메모 (보장 아님)
- 「JPEG 품질을 낮춘다」「작업을 한 줄로 직렬화한다」는 일반적 기법.
- **특허 비침해를 보장하지 않음.** 상업 출시 전 필요 시 별도 법률 검토.
- 신규 청구항으로 주장할 만한 독자적 센서·인식 파이프라인은 본 번들에 없음.

## 롤백
`restore-perf-bundle-a.bat`
