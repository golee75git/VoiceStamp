# SECURITY: inbox import progress (2026-08-12)

## Summary

Show progress while importing selected inbox stamps to the device (`앱으로 가져오는 중 current / total` + short title) so multi-photo imports do not look frozen.

## Changes

| Item | Change |
|------|--------|
| `ProjectCollectScreen` | `importProgress` state during `handleImportSelected`; overlay text under spinner |
| Help | Document progress cue |

## Notes

- UI only; import/download logic unchanged.
- Progress cleared in `finally`.

## Rollback

`restore-inbox-import-progress.bat`
