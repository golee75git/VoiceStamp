# SECURITY: stable list Image during select toggles (2026-08-09)

## 변경 요약

- 선택 토글 시 `Image`/`StampListThumb` key remount 제거.
- 선택 중 왼쪽 테두리 폭 고정(`cardSelectChrome`), 선택 시에만 색 변경.
- 체크박스 고정 폭 컬럼. 선택 모드에서는 그려진 URI 유지(`lockOriginal`).
- 목록 전체 remount(listPaintEpoch) 제거.

## 보안

- 로컬 UI만. 네트워크·권한 변경 없음.

## 롤백

`restore-list-thumb-stable.bat`
