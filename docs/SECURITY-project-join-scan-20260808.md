# 보안·라이선스·특허 점검 — 사업 참여 QR 찍기 (2026-08-08)

## 변경 요약
- 사업 취합「코드로 참여」에 **QR 찍기**(기존 `expo-camera` `CameraView` + `barcodeTypes: ['qr']`).
- 인식 후 기존 `parseJoinPayload`·참여 확인 Alert와 동일 경로.
- 참여 성공 시 설정이 아니라 **촬영 화면**으로 이동 (`onJoinedGoCamera`).
- **신규 npm 없음.**

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `ProjectCollectScreen.tsx`, `MainScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-project-join-scan.bat`, 본 문서 |
| **재사용** | `expo-camera`(기존), `parseJoinPayload` |
| **스냅샷** | `src.pre-project-join-scan/` |

## 글꼴·의존성·GPL
- 폰트·패키지 추가 없음. `expo-camera` 기존 라이선스 유지.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 스캔 결과 | 로컬 파싱만. 임의 URL도 업로드 전 `uploadCode`로 서버 검증 |
| 카메라 | 사용자 제스처로 권한 요청. 웹은 비활성 |
| Data safety | 신규 클라우드 경로 없음 |

## 특허
- 특허 비침해 보장하지 않음. 인앱 QR 스캔·참여는 일반 패턴일 수 있음.

## 롤백
`restore-project-join-scan.bat`
