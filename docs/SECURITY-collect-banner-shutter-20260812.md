# SECURITY: collect banner above shutter (2026-08-12)

## Summary

Move the camera-home 「취합 중」 banner from the top of the screen to **directly above the capture shutter**, so it sits in the shoot path without covering the key visual.

## Changes

| Item | Change |
|------|--------|
| `CameraScreen` | Banner after splash image, before shutter; centered, slightly tighter padding |
| Help | 「촬영 버튼 위」 wording |

## Notes

- UI layout only; join/upload logic unchanged.
- No new dependencies.

## Rollback

`restore-collect-banner-shutter.bat`
