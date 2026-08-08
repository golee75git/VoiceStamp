# 보안·라이선스·특허 점검 — NCP presigned 직통 올리기·받기 (2026-08-08)

## 변경 요약
- 사진 바이트는 앱↔NCP **presigned PUT/GET**. Vercel Function은 prepare/complete/downloadUrl·meta만.
- 구 `upload`/`download`(base64)는 `400` 거절(A안).
- 웹 설정에서 「사업 취합」 숨김. npm 추가 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `api/project.js`, `projectCollectApi.ts`, `projectUploadQueue.ts`, `projectImportService.ts`, `SettingsScreen.tsx`, `help.html`, `NCP-PROJECT-SETUP.md`, `RESTORE.md` |
| **신규** | `restore-presign-direct.bat`, 본 문서 |
| **재사용** | `presignGet`, SigV4, manifest/meta, upload queue |
| **스냅샷** | `api.pre-presign-direct/`, `src.pre-presign-direct/`, `public.pre-presign-direct/` |

## 글꼴·의존성·GPL
- 추가 없음. 기존 OFL·라이선스 유지.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| Secret | Vercel env만. 앱에는 putUrl/getUrl(짧은 TTL)만 |
| 권한 | prepare/complete=uploadCode, downloadUrl=collectorPin |
| 키 | 서버가 `stamps/{id}.jpg` 고정 |
| 웹 | 취합 UI 숨김 + 업로드 스케줄 웹 스킵 |
| Data safety | 신규 수집 없음. 전송 경로만 변경 |

## 특허
- 특허 비침해 보장하지 않음. Presigned 직통과 메타 중계는 일반 클라우드 패턴일 수 있음.

## 롤백
`restore-presign-direct.bat` 후 API Redeploy·구 APK.
