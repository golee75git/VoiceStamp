# SECURITY: keep list scroll after deselect (2026-08-09)

## 변경 요약

- FlatList `listPaintEpoch` 재마운트 제거 → 마지막 선택 해제 시 스크롤 유지.
- 목록 썸네일은 기존 fullUri-first 유지(하얀 칸 수정은 유지).

## 보안

- UI 스크롤·목록 key만 변경. 네트워크·권한 없음.

## 롤백

`restore-list-scroll-keep.bat`
