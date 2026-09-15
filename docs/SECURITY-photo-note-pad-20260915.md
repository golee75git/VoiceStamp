# 보안·라이선스·특허 점검 — 사진 위 글 칸 (2026-09-15)

## 변경 요약
저장·수정 큰 미리보기에서 사진 위에 둥근 글 칸을 여러 개 두고 위치를 옮긴다. 별도 영역·워터마크는 그대로다. JPEG에 굽는 것은 「이미지 저장」경로뿐이며 앱 원본 사진은 덮지 않는다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `src/services/photoNotePad.ts`, `src/services/applyPhotoNotePad.ts`, `src/components/PhotoNotePadLayer.tsx`, `restore-photo-note-pad.bat`, 본 문서 |
| **재사용·수정** | `src/types/stamp.ts`, `src/db/schema.ts`, `src/db/database.ts`, `src/services/stampRepository.ts`, `src/services/saveStamp.ts`, `src/services/renderStampWatermarkNative.ts`, `src/services/renderStampCaptionNative.ts`, `src/components/StampSavePreview.tsx`, `src/components/StampSaveModal.tsx`, `src/components/StampSaveZoomViewer.tsx`, `public/help.html` |
| **재사용(무수정)** | `src/services/exportOnDemand.ts`, `src/screens/MainScreen.tsx` |
| **스냅샷** | `src.pre-photo-note-pad/`, `public.pre-photo-note-pad/` |

## 글꼴 (OFL)
- 글꼴 파일 추가 없음. 미리보기·합성 모두 시스템 글꼴.

## 의존성·GPL
- npm 추가 없음. 기존 `react-native-image-marker`(MIT), `react-native-gesture-handler`, `react-native-reanimated`만 사용.
- `license-checker --production --summary`(2026-09-15): 대부분 MIT/ISC/Apache-2.0/BSD. 트리에 `(MIT OR GPL-3.0-or-later)`·`(BSD-3-Clause OR GPL-2.0)` 이중 허가 항목이 있으나 이번 변경으로 추가되지 않음.
- GPL 단독 신규 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 변경 없음 |
| 입력 | 글 칸은 기기 SQLite JSON. 제어문자 제거, 개수·길이 상한 |
| Play | 새 권한 없음. 사용자 글을 자기 사진 JPEG에만 합성 |

## 저작권·독자성
- 식별자 `PhotoNotePad`, `applyPhotoNotePadToUri`, `PhotoNotePadLayer`, `photo-note-pad`는 이 프로젝트 전용.
- 공개 검색에서 동일 식별자 구현을 복사하지 않음.

## 특허 검토 메모 (보장 아님)
- 사진 위 글 칸을 끌어 옮기는 구성은 검토가 필요할 수 있음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-photo-note-pad.bat`

## 배포
- APK: `VoiceStamp_20260915_095143.apk`
- 다운로드: https://raw.githubusercontent.com/golee75git/VoiceStamp/main/releases/VoiceStamp_20260915_095143.apk
