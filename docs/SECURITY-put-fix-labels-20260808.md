# SECURITY: NCP PUT Content-Type 재시도 + 엑셀·수신 템플릿 칸 이름 (2026-08-08)

## 변경 요약

- `prepareUpload` 응답에 `putUrl`(Content-Type 서명) + `putUrlPlain`(호스트만 서명) 제공.
- 앱: Content-Type PUT 실패 시 서명 없는 PUT으로 재시도. 첫 실패부터 Alert.
- 엑셀 `fixed_plus`: 스탬프에 칸 이름이 없으면 `templateId`로 로컬 템플릿 조회.
- 수신 import: 메타에 칸 이름이 없고 `templateId`만 있으면 로컬 템플릿으로 보강.

## 보안

- NCP Access Key·Secret은 서버 env만. 클라이언트 불변.
- Presigned URL은 짧은 TTL·경로 검증 유지.
- 템플릿 조회는 수신자 기기 로컬 DB만 사용(템플릿이 없으면 기본 이름).

## 롤백

`restore-put-fix-labels.bat` → `api/` · `src/` · `public/help.html`
