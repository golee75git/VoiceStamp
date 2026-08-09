# SECURITY: list thumb remount per selection key (2026-08-09)

## 변경 요약

- `StampListThumb`에 `selected` prop. 선택 토글 시 해당 카드 `Image`만 key로 재마운트.
- 여러 장 선택 후 중간 해제에서도 하얀 칸이 남지 않도록 함.
- 마지막 해제 시 목록 remount·스크롤 보정(기존)은 유지.

## 보안

- 로컬 UI만. 네트워크·권한 변경 없음.

## 롤백

`restore-list-thumb-selkey.bat`
