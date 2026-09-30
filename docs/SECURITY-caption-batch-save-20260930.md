# 보안·라이선스·특허 점검 — 여러 장 이미지 저장 실패 (2026-09-30)

## 변경 요약
저장 목록에서 여러 장을 이미지 저장할 때 일부만 실패로 집계되던 합성을 고친다. 캡션 표의 세로선은 같은 그림 주소를 세 번 쓰지 않고 파일 3장으로 둔다. 내보낼 사진을 줄인 뒤 네이티브 비트맵은 파일로 쓴 다음 바로 놓는다. npm·글꼴 파일 없음. 화면 문구·권한 변경 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-caption-batch-save.bat`, 본 문서, `src.pre-caption-batch-save/`, `public.pre-caption-batch-save/` |
| **재사용·수정** | `src/services/exportStampImage.ts`, `src/services/renderStampCaptionNative.ts`, `src/constants/apkBuildLabel.ts`, `public/help.html`, `public/landing.html`, `public/info.html` |
| **재사용(무수정)** | `src/services/exportOnDemand.ts` (번들 C), `src/services/galleryService.ts` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 앱은 시스템 글꼴만 사용. 프로젝트에 번들된 OFL 글꼴 파일을 이번 수정에서 쓰지 않음.

## 의존성·GPL
- npm 추가 없음. 번들 A/B/C 재패치 없음.
- 기존 `react-native-image-marker`, `expo-image-manipulator`만 그대로 호출. 라이브러리 소스를 복사·변형하지 않음.
- `license-checker --production --summary`(2026-09-30): MIT 533, ISC 41, Apache-2.0 15 등. GPL은 기존 이중 허가 `(MIT OR GPL-3.0-or-later)` 1건, `(BSD-3-Clause OR GPL-2.0)` 1건뿐. GPL 단독 신규 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음. 사진·메모는 기기 안에서만 합성 |
| 입력 | 새 입력 없음. 캐시 파일명은 행 번호와 `l`/`m`/`r`만 |
| 저장 | 갤러리 권한·앨범 경로 변경 없음 |
| Play | 새 권한·데이터 수집 없음. 기존 이미지 저장과 같음 |

## 저작권·독자성
- 식별자 `CAPTION_BATCH_SAVE_HOST`, `restore-caption-batch-save`는 이 프로젝트 전용.
- 기존 `createSolidJpeg`를 세로선마다 한 번씩 호출하고, 기존 이미지 참조의 `release()`만 호출. 외부 워터마크 예제의 처리 순서를 가져오지 않음.

## 특허 검토 메모 (보장 아님)
- 사진 아래 표 형태로 글을 합성하는 구성 자체는 이전부터 있으며, 이번 변경은 그 합성에 쓰는 세로선 파일을 나누고 비트맵을 일찍 놓는 것이다.
- 사진에 글을 겹쳐 저장하는 구성은 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-caption-batch-save.bat`

## 배포
- APK: `VoiceStamp_20260930_233350.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260930_233350.apk
