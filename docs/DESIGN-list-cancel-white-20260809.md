# DESIGN: 저장 목록 「취소」 후 흰 칸·스크롤 이상 (2026-08-09)

## 증상

- 여러 장 선택 → 중간 체크 해제는 정상.
- 「취소」 후: 위쪽 몇 칸이 하얗거나 안 보임, 목록 테두리만 보임.
- 흰 부분을 터치하면 사진이 나타나며 선택 잔상처럼 보이기도 함.
- 상단 글자는 이미 「저장 목록」/「선택」으로 바뀜 → React `selecting`은 false.

## 원인 정리

1. **헤더 `onChromeLayout` → `scrollToOffset` 보정**  
   검색/칩이 숨었다가 돌아올 때 FlatList 오프셋을 강제로 밀어, 위쪽 항목이 화면 밖으로 나가거나 셀이 깨져 보임.
2. **취소 직후 한 프레임 복원만으로는 부족**  
   헤더 레이아웃이 끝난 뒤에야 content size가 안정됨.
3. **Android FlatList 네이티브 행 잔상**  
   상태만 바꿔도 Image/체크 UI가 터치 전까지 다시 그려지지 않는 경우가 있음.

중간 체크 해제는 `selecting===true`라 Image remount가 없어 괜찮았고, 취소만 한 번에 chrome+URI+row가 바뀌어 깨짐.

## 적용한 해결 (검증 APK: `VoiceStamp_20260809_134036.apk`)

| 단계 | 내용 | 비고 |
|------|------|------|
| ① | 헤더 `onChromeLayout`의 `scrollToOffset` 보정 **제거** | 필수 |
| ② | 선택 **진입 직전** 오프셋 저장 → 취소 시 0/32/80/160/280ms 재적용 + `onContentSizeChange` | 스크롤 맞춤 |
| ③ | 「취소」에만 FlatList `key={numColumns-browseMountKey}`로 **1회 재마운트** | 흰 칸·선택 잔상 해소 |

중간 선택 토글에서는 remount하지 않음(속도·하얀 칸 재발 방지).

## 다음에 같은 문제면

1. `restore-cancel-list-remount.bat` / `restore-cancel-scroll-boost.bat` / `restore-chrome-scroll-adj.bat`로 단계별 되돌리기 가능.
2. 재발 시 체크리스트:
   - [ ] 헤더 onLayout이 다시 scroll을 미는지
   - [ ] 취소 경로에서 Image/`StampListThumb` key remount를 쓰는지(쓰지 말 것)
   - [ ] 취소 시에만 list `key` bump + 진입 오프셋 복원이 있는지
3. 관련 보안 메모:  
   `docs/SECURITY-chrome-scroll-adj-20260809.md`  
   `docs/SECURITY-cancel-scroll-boost-20260809.md`  
   `docs/SECURITY-cancel-list-remount-20260809.md`

## 하지 말 것

- 선택 토글마다 FlatList/Image remount
- 헤더 높이 차로 FlatList offset을 보정하는 패턴 재도입
- expo-image 등 npm 추가(필요하면 먼저 제안만)

## 성능

재마운트는 **취소 1회·보이는 창만**. 일상 스크롤·중간 해제에는 추가 비용 없음.
