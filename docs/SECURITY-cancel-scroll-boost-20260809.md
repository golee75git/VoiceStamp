# SECURITY: strengthen cancel enter-scroll restore (2026-08-09)

## 변경 요약

- 「취소」 시 선택 진입 오프셋을 0/32/80/160/280ms에 재적용.
- FlatList `onContentSizeChange`에서도 pending 오프셋 복원.
- ① 헤더 chrome scroll adjust는 제거된 상태 유지.

## 보안

- 로컬 UI·스크롤만. 네트워크·권한 변경 없음. 새 npm 없음.

## 라이선스·특허

- 자체 타이밍 복원. 외부 복사 없음. OFL/GPL 신규 없음.

## 롤백

`restore-cancel-scroll-boost.bat`
