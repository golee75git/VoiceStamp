# 보안·라이선스·특허 점검 — 사업 QR 찍기 미리보기 (2026-08-08)

## 변경 요약
- 참여「QR 찍기」오버레이에서 `CameraView`를 전체 화면으로 깔아 **미리보기가 보이도록** 수정.
- 가운데 맞춤용 네모 가이드 + 하단 안내/닫기.
- **신규 npm 없음.** 카메라 권한·스캔 로직 변경 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-join-scan-preview.bat`, 본 문서 |
| **재사용** | 기존 `expo-camera` `CameraView` QR 스캔 |
| **스냅샷** | `src.pre-join-scan-preview/`, `public.pre-join-scan-preview/` |

## 글꼴·의존성·GPL
- 폰트·패키지 추가 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 카메라 | 기존과 동일. 사용자 제스처로 권한 요청 후 스캔 |
| UI only | 미리보기 레이아웃·가이드만 변경. 업로드/저장 경로 없음 |
| Data safety | 신규 수집·전송 없음 |

## 특허
- 특허 비침해 보장하지 않음. 카메라 미리보기·가이드 프레임은 일반 UI 패턴일 수 있음.

## 롤백
`restore-join-scan-preview.bat`
