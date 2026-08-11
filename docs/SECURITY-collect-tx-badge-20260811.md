# SECURITY: collect tx badge + QR hint move (2026-08-11)

## Summary

UX-only: enlarge the save-modal collect badge (`취합전송 · 사업명`) beside 저장 유형, and move the long QR/연결확인 help text from under the save-modal button into Settings → 사진 URL → QR.

## Changes

| Item | Change |
|------|--------|
| `StampSaveModal` `collectTxBadge` | font 11→14, padding/radius slightly larger |
| Save modal under 「연결확인」 | Remove `locationHint` paragraph |
| `SettingsScreen` QR section hint | Include 별도영역/워터마크 placement + empty `https://` = no QR |
| Help | Align copy |

## Notes

- No API, storage, or dependency changes.
- No new secrets; URL connect-check behavior unchanged.
- GPL/OFL: N/A (UI copy/style only).

## Rollback

`restore-collect-tx-badge.bat`
