# 보안·라이선스·특허 점검 — 사업 QR 일시 취합 설계 (2026-08-07)

## 변경 요약
- **FEAT-NCP-PROJECT-01 구현** (문서 + 앱 + `api/project.js`).
- QR/코드 1회 참여 → 저장 시 압축 업로드 → 관리자 수신·사업 폴더 import → 취합 엑셀.
- NCP Object Storage (SigV4, 신규 npm 없음). 미설정 시 503.

### 2026-08-07 SigV4 수정
- `fetch`에 수동 `Host` 헤더를 넣으면 서명 불일치(403)가 날 수 있어 제거.
- NCP 문서와 같이 `x-amz-content-sha256: UNSIGNED-PAYLOAD`로 서명.
- Content-Type은 전송만 하고 SignedHeaders에는 넣지 않음.
- 500 응답에 S3 본문 `hint`(짧게)를 넣어 운영 진단만 돕고, 비밀키는 노출하지 않음.

### 2026-08-07 Put AccessDenied 수정 (콘솔 업로드 OK / API만 거부)
- Put/Delete는 NCP 샘플과 같이 `UNSIGNED-PAYLOAD`, 전송 헤더(`content-length`·`content-type` 포함)를 모두 서명.
- Put/Delete는 Node `https.request` 사용.
- **암호화(KMS) 버킷**은 메인 계정 API 키로 Put 시 AccessDenied가 날 수 있음 → **Sub Account Access Key**만 Vercel에 넣을 것.
- 롤백: `restore-ncp-put-fix.bat` → `api.pre-ncp-put-fix/`.
- 특허 비침해 보장하지 않음. SigV4·S3 호환 Put은 일반 관용 패턴.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **신규** | `api/project.js`, `src/components/ProjectCollectScreen.tsx`, `src/services/projectCollect*.ts`, `projectUploadQueue.ts`, `projectImportService.ts`, `public/join.html`, `restore-ncp-project-qr.bat`, `docs/NCP-PROJECT-SETUP.md`, 본 문서 갱신 |
| **수정** | `MainScreen.tsx`, `SettingsScreen.tsx`, `saveStamp.ts`, `vercel.json`, `public/help.html`, `docs/PRIVACY.md`, `RESTORE.md` |
| **재사용** | `exportXlsx.ts`, `pdfImageForExport.ts`, `qrcode`, `expo-image-manipulator` |
| **스냅샷** | `src.pre-ncp-project-qr/`, `public.pre-ncp-project-qr/`, `api.pre-ncp-project-qr/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 UI 글꼴만.

## 의존성·GPL
- **신규 npm 없음.** Node `crypto` + 기존 `qrcode`(MIT)·`exceljs`.
- jszip MIT 경로 유지.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 비밀키 | Vercel env only |
| QR | uploadCode만 |
| PIN | 해시 저장(서버), 기기는 app_settings (SecureStore 미사용·신규 패키지 금지) |
| 동의 | 참여 확인 Alert |
| Data safety | 선택적·사용자 개시·일시·한국 리전 — PRIVACY 갱신 |
| 기본값 | 사업 취합 OFF |

## 특허
- 특허 비침해 보장하지 않음. Presign·QR 참여는 일반 패턴일 수 있음.

## 롤백
`restore-ncp-project-qr.bat`
