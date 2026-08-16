# 보안·라이선스·특허 점검 — 앱 내 미리보기 http(s) QR 열기 (2026-08-16)

## 변경 요약
- 앱 내 촬영 미리보기에서 QR이 보이면 촬영은 막지 않고, `http://`/`https://`만 「열기」로 브라우저에 연결한다.
- 인식 즉시 열지 않음. 시스템 카메라·카메라 홈은 변경 없음.
- 신규 패키지 없음. 기존 `expo-camera` 바코드 인식 + `normalizeHttpUrl` + `Linking.openURL`.

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-preview-qr-open.bat`, 본 문서 |
| **재사용·수정** | `InAppCameraPreview.tsx`, `CameraScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **재사용(무수정)** | `qrUrlExtractService.ts` `normalizeHttpUrl`, `expo-camera` MIT |
| **스냅샷** | `src.pre-preview-qr-open/`, `public.pre-preview-qr-open/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만.
- 프로젝트 `.ttf`/`.otf` 번들 없음.

## 의존성·GPL
- npm/Gradle 추가 없음.
- `expo-camera` MIT. GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| URL | `normalizeHttpUrl`만 통과한 http(s). 자격 증명·기타 스킴 거부 |
| 열기 | 사용자 「열기」탭 후에만 `Linking.openURL` |
| 권한 | 기존 카메라 권한만 |
| 네트워크 | 앱이 URL을 가져오지 않음. OS 브라우저가 연 뒤에만 접속 |
| Data safety | 신규 수집·서버 전송 없음 |
| Play | 스토어 권한·데이터 유형 변경 없음. 피싱 QR은 열기 전 주소 표시 |

## 저작권·독자성
- 기존 사업 QR 찍기·URL 정규화 경로 재사용. 외부 스캐너 UI 복사 없음.
- 식별자 `previewOpenHref`·`onPreviewHttpQr`·`httpQrListen`은 이 프로젝트 전용.

## 특허 검토 메모 (보장 아님)
- 미리보기에서 QR을 읽고 주소를 여는 구성은 일반 카메라 UX 수준.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-preview-qr-open.bat`
