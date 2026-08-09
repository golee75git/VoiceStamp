# SECURITY: list thumb lock original while selecting (2026-08-09)

## 변경 요약

- 선택 모드(`lockOriginal`): 목록 미리보기는 원본 URI만 사용(썸네일 교체 없음).
- 카드에 `key={id-selected}`로 컴포넌트 remount.
- 중간 체크 해제 시 Android 하얀 칸 완화. 마지막 해제 remount·스크롤 보정은 유지.

## 보안

- 로컬 파일 URI만. 네트워크·권한 변경 없음.

## 롤백

`restore-list-thumb-lockorig.bat`
