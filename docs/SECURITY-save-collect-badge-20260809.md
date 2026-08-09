# SECURITY: save-type collect badge (2026-08-09)

## 변경 요약

- 저장/수정 화면 「저장 유형」 옆에, 사업 취합 **연결 중**일 때만 「취합전송」 뱃지 표시.
- `getProjectJoin()` 로컬 조회로만 판단. 서버·QR·템플릿 id 변경 없음.
- 저장 유형 선택의 동작은 그대로 (뱃지는 표시만).

## 보안

- 추가 네트워크 호출 없음. 새 npm 없음. Play 권한 영향 없음.
- 뱃지에 사업명 전문을 UI에 길게 넣지 않음(접근성 label에만 사용).

## 라이선스·특허

- 자체 UI. 외부 복사 없음. OFL/GPL 신규 없음.

## 롤백

`restore-save-collect-badge.bat`
