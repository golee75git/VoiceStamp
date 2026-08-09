# SECURITY: remount list on cancel only (2026-08-09)

## 변경 요약

- 「취소」 시에만 FlatList `key`를 올려 행을 재마운트(중간 체크 해제는 제외).
- 진입 오프셋 재시도·헤더 scroll adjust 제거는 유지.

## 보안

- 로컬 UI만. 네트워크·권한 변경 없음. 새 npm 없음.

## 성능

- 일상 스크롤·선택 토글 비용 없음. 취소 1회에 visible window remount만.

## 롤백

`restore-cancel-list-remount.bat`
