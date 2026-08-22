# 보안·라이선스·특허 점검 — 저장·수정 화면 이미지 저장 (2026-08-22)

## 변경 요약
- 저장·수정 미리보기 아래에 **이미지 저장**을 둔다.
- 앱 목록 저장(수정) 후 기존 목록 JPEG 합성을 한 장 넣는다.
- 하단 「저장」 경로·갤러리 idle 기본(`앱만`)은 그대로다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-save-modal-image.bat`, 본 문서, `docs/DESIGN-save-modal-image-20260822.md` |
| **재사용·수정** | `src/components/StampSaveModal.tsx`, `src/services/saveStamp.ts`, `public/help.html`, `RESTORE.md`, PRD/PLAN/PROJECT/CHANGELOG/README, `수정기록.txt` |
| **재사용(무수정)** | `exportStampImage.ts` `saveStampsAsJpegToGallery`, `galleryService.ts`, `gallerySaveIdleQueue.ts` |
| **스냅샷** | `src.pre-save-modal-image/`, `public.pre-save-modal-image/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 앱 UI는 기존처럼 **시스템 글자**만 사용.
- 저장소에 이번 작업으로 `.ttf`/`.otf`를 넣지 않음.
- 프로젝트에  Bundled OFL 폰트 파일은 없음(기존 LICENSE-NOTICE와 동일).

## 의존성·GPL
- npm 추가 없음. 기존 `jszip` MIT 경로·Expo 모듈만 재사용.
- GPL 경로 신규 채택 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 새 요청 없음. JPEG는 기기 갤러리 또는 웹 다운로드 |
| 권한 | 기존 갤러리 쓰기만. 새 권한 없음 |
| 실패 | 갤러리 실패 시에도 앱 스탬프 유지(기존 정책) |
| QR URL | 저장과 같이 `http://`·`https://`만 허용 |
| Play | 데이터 유형 변경 없음. 사진·메모는 사용자가 넣은 내용을 기기에 저장 |

## 저작권·독자성
- 식별자 `skipIdleCaptionGallery`, `handlePreviewJpegGallerySave`, `save-modal-image`는 이 프로젝트 전용.
- 목록 JPEG 합성을 저장 화면에 연결한 것이며 외부 앱 UI·주석을 베끼지 않음.

## 특허 검토 메모 (보장 아님)
- 사진에 제목·메모를 입혀 앨범에 넣는 방식은 일반 내보내기 관용일 수 있음.
- **특허 비침해를 보장하지 않음.** 별도 청구항 대조가 필요하면 법무에서 검토한다.

## 롤백
`restore-save-modal-image.bat`

## 배포
- APK: `VoiceStamp_20260822_225901.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260822_225901.apk
