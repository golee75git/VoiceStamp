# SECURITY: import progress inset (2026-08-12)

## Summary

Keep inbox import progress (`앱으로 가져오는 중 n / 전체`) clear of the Android system navigation bar by adding bottom padding on the busy overlay and placing the progress text above the spinner.

## Changes

| Item | Change |
|------|--------|
| `ProjectCollectScreen` overlay | `paddingBottom` 72 (Android); progress box above spinner |

## Notes

- Layout only; import logic unchanged.

## Rollback

`restore-import-progress-inset.bat`
