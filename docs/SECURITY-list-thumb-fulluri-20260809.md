# SECURITY: list thumb fullUri-first (2026-08-09)

## 변경 요약

- `StampListThumb`: 원본 URI로 먼저 표시. 디스크 썸네일이 있을 때만 교체.
- 없는 `thumbs/{id}.jpg`를 먼저 넣어 Android 하얀 칸이 남던 경로 제거.
- 마지막 선택 해제·「취소」 시 FlatList `listPaintEpoch`로 목록 재마운트.

## 보안

- 로컬 파일 URI만 사용. 네트워크·권한 변경 없음.

## 롤백

`restore-list-thumb-fulluri.bat`
