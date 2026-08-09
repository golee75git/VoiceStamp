# SECURITY: list select scroll stable + white cell remount (2026-08-09)

## 변경 요약

- 상단 크롬 `onLayout` 높이 차로 스크롤 offset 보정 → 선택 시 롤링 완화.
- 내보내기 바 표시 중에도 하단 inset 유지 → 선택 진입 점프 완화.
- 마지막 선택 해제·「취소」 시 FlatList remount + `restoreListScroll` → 하얀 칸 제거·스크롤 유지.
- 목록 썸네일 fullUri-first는 유지.

## 보안

- 로컬 UI·스크롤만. 네트워크·권한 변경 없음.

## 롤백

`restore-list-select-stable.bat`
