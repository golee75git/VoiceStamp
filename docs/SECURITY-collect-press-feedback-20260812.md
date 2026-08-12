# SECURITY: collect press feedback (2026-08-12)

## Summary

Add pressed visual feedback (opacity) to project-collect buttons via a shared `collectPressStyle` helper so taps feel responsive.

## Changes

| Item | Change |
|------|--------|
| `ProjectCollectScreen` | `collectPressStyle` + `styles.pressed` on primary/secondary/actions/chips/bars/rows/inbox/template picker |
| Help | Note that buttons dim when pressed |

## Notes

- UI only; no API changes.

## Rollback

`restore-collect-press-feedback.bat`
