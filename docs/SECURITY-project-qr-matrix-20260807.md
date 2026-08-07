# 보안·라이선스·특허 점검 — 사업 QR 격자 표시 (2026-08-07)

## 변경 요약
- 사업 취합 화면「QR 준비 중…」고착 수정.
- React Native에 canvas가 없어 `qrcode.toDataURL`이 실패·빈 문자열이 됨 → 기존 `qrcode.create()` 모듈을 View 격자로 그림.
- **신규 npm 없음.** 기존 `qrcode`(MIT)만 재사용.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `src/components/ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md` |
| **신규** | `restore-project-qr-matrix.bat`, 본 문서 |
| **스냅샷** | `src.pre-project-qr-matrix/`, `public.pre-project-qr-matrix/` |
| **재사용** | `qrcode` 패키지 `create()` |

## 글꼴 (OFL)
- 폰트 추가 없음. 시스템 UI 글꼴만.

## 의존성·GPL
- 신규 패키지 없음. `qrcode` MIT 유지.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| QR 내용 | 기존과 동일: `projectId`+`uploadCode`만 (PIN 없음) |
| 실패 UX | 격자 실패 시 안내 문구 + 코드/공유 유지 |
| Data safety | 클라우드 전송 방식 변경 없음 |

## 특허
- 특허 비침해 보장하지 않음. QR 모듈을 픽셀·격자로 그리는 방식은 일반 관용 패턴일 수 있음.

## 롤백
`restore-project-qr-matrix.bat`
