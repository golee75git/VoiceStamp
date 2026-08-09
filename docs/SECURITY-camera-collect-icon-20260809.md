# SECURITY: camera home collect icon (2026-08-09)

## 변경 요약

- 카메라 홈 옆 메뉴에 「취합」 아이콘을 저장 템플릿 **위**에 추가.
- `getProjectCollectEnabled()` 가 true(설정 사업 취합 「사용」)일 때만 표시. 웹은 숨김.
- 탭 시 기존 `ProjectCollectScreen` 허브 진입(설정 「시작하기 · QR·수신」과 동일).
- 카메라에서 연 경우 `collectOpenedFromLink` 로 뒤로가기 → 카메라.

## 보안

- 새 네트워크·권한·서버 액션 없음. 기존 취합 허브만 호출.
- `getProjectCollectEnabled` 로컬 설정 조회만. npm 추가 없음.
- Play Store: 권한·데이터 수집 범위 변동 없음.

## 라이선스·특허

- 자체 UI 배선. 외부 구현 복사 없음. OFL/GPL 신규 글꼴·패키지 없음.
- 특허 검토 필요 구성 없음(기존 취합 진입점 UI만 추가).

## 롤백

`restore-camera-collect-icon.bat`
