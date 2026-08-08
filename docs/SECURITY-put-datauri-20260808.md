# SECURITY: PUT body from data URI base64 (2026-08-08)

## 변경 요약

- `projectUploadQueue`에서 `fetch(data:...)` 제거.
- `data:image/...;base64,...` 를 로컬 `atob`로 바이트 변환 후 NCP presigned PUT.

## 보안

- Presigned URL·NCP 키 처리 불변.
- PUT body 크기 상한(약 2.8MB) 유지.
- base64 페이로드만 디코드; `data:` 메타에 base64 표시가 없으면 거부.

## 롤백

`restore-put-datauri.bat` → `src/services/projectUploadQueue.ts`
