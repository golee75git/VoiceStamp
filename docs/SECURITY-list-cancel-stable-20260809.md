# SECURITY: list cancel path stability (2026-08-09)

## 변경 요약

- 「취소」로 선택 모드를 나갈 때 `StampListThumb`가 `fullUri`로 강제 교체하지 않음(그린 비트맵 유지, 썸네일만 있으면 soft upgrade).
- 선택 진입 시 스크롤을 기억하고, 취소 중 `onChromeLayout` 보정은 건너뛴 뒤 그 위치로 복원.
- 행 chrome hold는 제거(레이아웃 2단 변화로 상단 빈 칸·선택 잔상이 남던 경로).

## 보안

- 로컬 UI·스크롤만. 네트워크·권한·저장 경로 변경 없음.
- 새 npm 없음. Play 정책(권한/데이터) 영향 없음.

## 라이선스·특허

- 자체 UI 타이밍 조정. 외부 구현 복사 없음.
- OFL 글꼴·GPL 새 의존성 없음(기존 패키지만).
- 특허 claim 대조 대상이 되는 원격·서버 전송 로직 없음.

## 롤백

`restore-list-cancel-stable.bat`
