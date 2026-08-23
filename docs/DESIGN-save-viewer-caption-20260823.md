# 설계 — 저장·수정 탭 화면 표시 글 (2026-08-23)

## 목적
저장·수정에서 사진을 탭하면 전체 화면에서 사진과 제목·메모 표시 글을 함께 본다.
시트 미리보기 표는 그대로 두고, 탭 화면에만 큰 표시 글을 둔다.

## 동작
1. 미리보기 탭 → 기존 전체 화면 모달
2. `StampSavePreview` `variant="fullscreen"` (시트와 같은 입력값)
3. 별도 영역: 사진 아래 표. 워터마크: 사진 위 바
4. 표가 길면 세로 스크롤
5. 「닫기」·버리기 단추는 기존 위치

## 비범위
핀치 확대, JPEG 재합성, ViewShot, QR 생성, 신규 npm, 시트 레이아웃 변경, 연속 촬영 경로

## 헬스체크
번들 A/B/C 재패치 없음. 열 때 `renderStampJpegUri`·QR 인코딩 호출 없음. 저장 모달 `InteractionManager` 유지.

## 되돌리기
`restore-save-viewer-caption.bat`
