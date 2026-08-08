# SECURITY: list select/deselect thumbnail blank (2026-08-09)

## 변경 요약

- `StampListThumb`: remount 시에도 썸네일·원본 URI를 바로 표시, 로드 실패 시 원본 폴백, Image key 갱신.
- 마지막 선택 해제 시 `scheduleStampThumbs`로 목록 썸네일 재보장.
- FlatList `maintainVisibleContentPosition` 제거(Android 빈 셀 유발 완화).

## 보안

- 로컬 파일 URI·썸네일 경로만 사용. 네트워크·권한 변경 없음.

## 롤백

`restore-list-select-thumb.bat`
