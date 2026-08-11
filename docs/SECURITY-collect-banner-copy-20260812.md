# SECURITY: collect banner copy (2026-08-12)

## Summary

Rename camera-home join banner label from ambiguous 「취합 중」 to 「이 사업으로 전송」 so photographers see that new saves go to the joined project.

## Changes

| Item | Change |
|------|--------|
| `CameraScreen` banner title + a11y | `이 사업으로 전송` |
| Help | Matching wording |

## Notes

- Copy only; join/upload logic unchanged.
- Save-modal 「취합전송」 badge kept (same feature family).

## Rollback

`restore-collect-banner-copy.bat`
