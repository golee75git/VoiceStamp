# 보안·라이선스·특허 점검 — 앱 내 미리보기 QR 촬영 유지 (2026-08-16)

## 변경 요약
- 앱 내 미리보기에서 http(s) QR을 한 번 읽으면 바코드 분석을 바로 끄고 「열기」만 남긴다.
- 셔터는 바코드가 꺼진 뒤 `takePictureAsync`만 호출한다. 「열기」가 보이는 동안에는 추가 대기 없이 촬영한다.
- QR이 없는 장면은 촬영 직전에만 바코드를 끄고, 렌즈 준비 또는 짧은 제한 시간 뒤에 찍는다.
- 읽힌 주소는 저장 화면 QR URL 칸 초안으로 넘긴다. 촬영 경로에서 사진 OCR로 URL을 다시 찾지 않는다.
- 시스템 카메라·카메라 홈·사업 QR 찍기는 변경 없음.
- 신규 npm 패키지 없음.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-preview-qr-capture-fix.bat`, 본 문서 |
| **재사용·수정** | `CameraScreen.tsx`, `StampSaveModal.tsx`, `quickCaptureSave.ts`, `public/help.html`, `RESTORE.md` |
| **재사용(무수정)** | `InAppCameraPreview.tsx`, `qrUrlExtractService.ts` `normalizeHttpUrl`, `expo-camera` MIT |
| **스냅샷** | `src.pre-preview-qr-capture-fix/`, `public.pre-preview-qr-capture-fix/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만.
- 프로젝트 `.ttf`/`.otf` 번들 없음.

## 의존성·GPL
- npm/Gradle 추가 없음.
- `expo-camera` MIT. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)
- dual-license 기존 확정: jszip MIT, node-forge BSD-3-Clause.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| URL | `normalizeHttpUrl`만 통과한 http(s). 자격 증명·기타 스킴 거부 |
| 열기 | 사용자 「열기」탭 후에만 `Linking.openURL` |
| 저장 초안 | 잠근 http(s)만 로컬 필드에 채움. 서버 전송 없음 |
| 권한 | 기존 카메라 권한만 |
| 네트워크 | 앱이 URL을 가져오지 않음. OS 브라우저가 연 뒤에만 접속 |
| Data safety | 신규 수집·서버 전송 없음 |
| Play | 스토어 권한·데이터 유형 변경 없음. 피싱 QR은 열기 전 주소 표시 |

## 저작권·독자성
- 기존 미리보기 QR 열기·URL 정규화·저장 칸을 이어서 고친 것. 외부 스캐너·카메라 예제 복사 없음.
- 식별자 `hrefLocked`·`waitLensReadyAfterUnbind`·`capturedSourceUrl`·`saveSeedSourceUrl`은 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 미리보기 바코드와 정지 촬영을 같은 렌즈에서 쓰는 구성은 일반 카메라 UX 수준.
- 바코드를 끈 뒤 정지 촬영하는 순서는 기기 제약에 대한 처리이며, 청구항 대비 보장하지 않음.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-preview-qr-capture-fix.bat`

이전 기능(미리보기 QR 열기 자체)을 없애려면 `restore-preview-qr-open.bat`를 쓴다. 이 수정만 되돌릴 때는 본 BAT를 쓴다.

## 배포
- APK·커밋은 빌드 후 CHANGELOG에 기록.
