# SECURITY: remove list chrome scroll adjust (2026-08-09)

## 변경 요약

- 저장 목록 헤더 `onLayout`에서 FlatList `scrollToOffset`으로 오프셋을 맞추던 보정을 제거.
- 헤더 높이는 더 이상 목록 스크롤을 밀지 않음(①). 선택 진입 오프셋 복원은 기존 `exitSelection` 유지.

## 보안

- 로컬 UI만. 네트워크·권한·저장 경로 변경 없음.
- 새 npm 없음. Play 정책 영향 없음.

## 라이선스·특허

- 자체 코드 삭제성 최소 수정. 외부 구현 복사 없음.
- OFL/GPL 새 의존성 없음.
- 특허 검토 대상 원격/전송 로직 없음.

## 롤백

`restore-chrome-scroll-adj.bat`
