# SECURITY: joined project sent list + hide synced (2026-08-09)

## 변경 요약

- 업로드 상태에 `projectId`를 함께 저장(구형 string 값 호환).
- 참여한 사업 → 「보낸 사진」 로컬 목록(`ProjectSentList`).
- 설정: 「전송분 숨기기」(기본 꺼짐) — `synced`만 저장 목록에서 제외. 실패/대기분은 목록에 남김.

## 보안

- 서버 API·QR 변경 없음. 로컬 `app_settings`만 확장.
- 새 npm 없음. Play 권한 영향 없음.

## 라이선스·특허

- 자체 UI/로컬 메타. 외부 복사 없음.

## 롤백

`restore-project-sent-list.bat`
