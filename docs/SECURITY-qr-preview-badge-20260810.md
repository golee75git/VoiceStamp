# SECURITY — QR preview + collect badge name (2026-08-10)

## Change
- Join QR scanner: wrap `CameraView` in `flex:1` slot with `collapsable={false}` (same pattern as capture preview) so Android shows the live preview instead of a black surface.
- Save-screen collect badge: remove `maxWidth: 72%` / `flexShrink` so `취합전송 · {사업명}` can show the full name (wraps under label when long).
- Rollback: `restore-qr-preview-badge.bat` → `src.pre-qr-preview-badge/` · `public.pre-qr-preview-badge/`.

## Why
QR recognition worked but preview stayed black; long project names were clipped with ellipsis.

## Security notes
- Camera permission flow unchanged; still device-local barcode scan then existing join parse.
- No new npm dependencies or fonts.
- GPL/OFL: unchanged.

## Patent note
Camera preview layout adjustment is routine UI; no patent-clearance claim.

## Files
- Changed: `ProjectCollectScreen.tsx`, `StampSaveModal.tsx`, `public/help.html`
- New: this note, restore bat, snapshots
