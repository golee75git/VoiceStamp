# SECURITY: mainint1 refresh (2026-08-11)

## Summary

Replace bundled left-hand camera home asset `assets/mainint1.png` with a refreshed image. No logic, API, or dependency changes.

## Scope

| Item | Change |
|------|--------|
| `assets/mainint1.png` | New binary (left-hand home theme in `CameraScreen`) |
| APK / landing / settings label | New dated APK name only |
| npm / native modules | None |

## Notes

- Asset only; no new network calls or secrets.
- GPL/OFL: image asset swap; no font or library added.
- Patent: N/A (static PNG).
- Play: same package; tester APK channel unchanged.

## Rollback

`restore-mainint1-refresh.bat` → `assets.pre-mainint1-refresh/` (+ public/src label snapshots).
