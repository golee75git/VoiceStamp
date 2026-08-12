# SECURITY: Collect join one-path + save feedback (2026-08-12)

## Summary

UX priorities 3–4 (minimal):

1. **Join one-path** — After connect, go straight to camera (no success Alert). Keep switch-project confirm. Join screen recovery hint; align `help.html` / `join.html`.
2. **Post-save feedback** — In-memory bus + camera-home snack: 「저장됨」 / 「올리는 중」 / 완료·실패.

## Changes

| Item | Change |
|------|--------|
| `ProjectCollectScreen.tsx` | Skip success/pre-join Alerts; recovery hint |
| `projectUploadFeedback.ts` | **New** — subscribe/emit only (no persistence) |
| `projectUploadQueue.ts` / `saveStamp.ts` | Emit upload/save events |
| `CameraScreen.tsx` | Snack banner above collect banner |
| `help.html` / `join.html` | One-path + recovery copy |

## Security / privacy / Play

- No new permissions, network endpoints, or stored telemetry.
- Feedback bus is process-local; no stamp content in events (project name only for upload states).
- Join still requires mark + valid codes; switch-project confirm unchanged.
- Data safety: unchanged.

## Fonts / licenses

- No new fonts or npm packages. System UI fonts only. No GPL added.

## Patent note

- UI feedback and navigation only; no novel technical claim. Patent review not indicated.

## Rollback

`restore-collect-save-feedback.bat`
