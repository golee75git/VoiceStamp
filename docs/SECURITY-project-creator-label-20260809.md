# SECURITY: project creator label (local) (2026-08-09)

## 변경 요약

- 사업 만들기에 필수 「만든 회사/사람」(`creatorLabel`) 입력.
- `OwnedProject`에만 저장(관리자 기기 SQLite `app_settings`). `apiCreateProject`·QR·참여 링크에는 미포함.
- 만든 사업 목록·초대 QR 화면에 로컬 표시만.

## 보안

- 서버/클라우드로 전송하지 않음 → 노출 면적 증가 없음.
- 입력 길이 40, 경로 문자 sanitization.
- 새 npm 없음. Play 권한 변경 없음.

## 라이선스·특허

- 자체 UI/로컬 필드. 외부 구현 복사 없음.
- OFL/GPL 신규 의존성 없음.
- 특허 검토 대상 원격 전송·인증 로직 없음.

## 롤백

`restore-project-creator-label.bat`
