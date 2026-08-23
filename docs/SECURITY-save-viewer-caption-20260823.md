# 보안·라이선스·특허 점검 — 저장·수정 탭 화면 표시 글 (2026-08-23)

## 변경 요약
- 저장·수정에서 사진을 탭한 전체 화면에 기존 `StampSavePreview` fullscreen을 스크롤로 표시한다.
- JPEG 합성·QR 생성·핀치 확대는 이 화면에 넣지 않는다.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-save-viewer-caption.bat`, 본 문서, `docs/DESIGN-save-viewer-caption-20260823.md` |
| **재사용·수정** | `src/components/StampSaveModal.tsx`, `src/components/StampSaveZoomViewer.tsx`, `src/components/StampSavePreview.tsx`, `public/help.html`, `RESTORE.md`, PRD/PLAN/PROJECT/CHANGELOG/README, `수정기록.txt`, `docs/LICENSE-NOTICE.md` |
| **재사용(무수정)** | `src/services/captionTable.ts`, `src/services/exportStampImage.ts`, `src/constants/apkBuildLabel.ts`(빌드 시 파일명만) |
| **스냅샷** | `src.pre-save-viewer-caption/`, `public.pre-save-viewer-caption/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 앱 UI는 기존처럼 **시스템 글자**만 사용한다.
- 저장소에 `.ttf` / `.otf` / `.woff` 없음. 프로젝트에 Bundled OFL 폰트 파일은 없다.
- 상업적 OFL 글꼴 파일을 새로 넣지 않았다.

## 의존성·GPL
- npm 추가 없음. 기존 `jszip`은 MIT 경로만 사용(기존 LICENSE-NOTICE §3).
- GPL 경로 신규 채택 없음.
- `qrcode`·`react-native-image-marker`·`react-native-view-shot`를 이 화면에서 호출하지 않음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | 새 요청 없음. 기기 안 View만 |
| 권한 | 변경 없음 |
| 입력 | 저장 화면에 이미 있는 제목·메모·좌표만 표시. 새 필드 없음 |
| QR URL | 이 화면에서 QR을 그리지 않음. 저장 JPEG 경로는 기존 http(s) 제한 유지 |
| Play | 데이터 유형 변경 없음. 민감 권한 추가 없음. Data safety 초안 변경 없음 |

## 저작권·독자성
- 식별자 `SAVE_VIEWER_CAPTION`, `save-viewer-caption`, `restore-save-viewer-caption`은 이 프로젝트 전용.
- 기존 저장 미리보기 View를 탭 화면에 연결한 것이며 외부 앱 UI·주석을 베끼지 않음.

## 특허 검토 메모 (보장 아님)
- 사진 아래 제목·메모를 보여 주는 화면은 일반 미리보기 관용일 수 있음.
- **특허 비침해를 보장하지 않음.** 별도 청구항 대조가 필요하면 법무에서 검토한다.

## 롤백
`restore-save-viewer-caption.bat`

## 배포
- APK: `VoiceStamp_20260823_135535.apk`
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260823_135535.apk
