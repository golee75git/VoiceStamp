# 설계 — 웹테스트 저장 버튼 (2026-08-03)

## 문제

1. `react-native-web`의 `Alert.alert`가 no-op → 설정 저장 팝업 없음(값은 저장됨).
2. 웹 스탬프 신규 저장이 `fetch(blob:)` 경로에서 실패 → 모달 유지·목록 미반영.
3. 실패 시 스크롤 안 글씨만 있어 사용자가 “버튼이 안 눌림”으로 오인.

## 해법 (최소)

| 파일 | 역할 |
|------|------|
| `src/utils/confirmAlert.ts` | **재사용** — 기존 `showAlert`(웹=`window.alert`) |
| `src/components/SettingsScreen.tsx` | 저장 완료/실패 → `showAlert` |
| `src/components/StampSaveModal.tsx` | 저장 실패·사진 없음·QR 오류 → `showAlert` + `setError` |
| `src/services/fileService.ts` | 웹: `Image`+`canvas`로 JPEG data URL(긴 변 상한·기존 화질 상수) |
| `public/help.html` | 웹 저장·설정 안내 |

## 새 파일 / 변경 파일

- **새로 작성:** `restore-web-save-alert.bat`, `docs/SECURITY-web-save-alert-20260803.md`, `docs/DESIGN-web-save-alert-20260803.md`, 스냅샷 `src.pre-web-save-alert/`, `public.pre-web-save-alert/`
- **변경(기존):** `fileService.ts`, `SettingsScreen.tsx`, `StampSaveModal.tsx`, `help.html`, `RESTORE.md`

## 되돌리기

`restore-web-save-alert.bat` (§213)
