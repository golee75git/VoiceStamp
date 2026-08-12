# SECURITY: collect back hit target (2026-08-12)

## Summary

Make project-collect navigation easier: enlarge the header 「뒤로」 control and route Android hardware back through the same steps (close QR scan → hub → leave screen).

## Changes

| Item | Change |
|------|--------|
| `ProjectCollectScreen` | Large `‹ 뒤로` button (min 48×96), `hitSlop`, shared `handleHeaderBack` |
| Hardware back | Handled inside collect screen (same as header) |
| `MainScreen` | Defers `projectCollect` hardware back to the child (`return false`) |
| Help | Android back section updated |

## Notes

- UI / navigation only; no API or storage changes.

## Rollback

`restore-collect-back-hit.bat`
