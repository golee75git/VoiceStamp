# SECURITY — collect transfer badge shows project name (2026-08-10)

## Change
- Stamp save modal badge text: `취합전송 · {join.name}` (truncate with `numberOfLines={1}`).
- Accessibility labels include the same project name.
- Help text updated to match.
- Rollback: `restore-collect-tx-name.bat` → `src.pre-collect-tx-name/` · `public.pre-collect-tx-name/`.

## Why
Phase 1 (display only): make the upload target project visible next to the collect badge. No join switch UI.

## Security notes
- Uses existing local `getProjectJoin().name` already loaded for the badge gate. No new network calls or fields.
- No new npm dependencies or fonts.
- GPL/OFL: unchanged; no new library or typeface assets.

## Patent note
UI label concatenation is routine; no patent-clearance claim is made.

## Files
- Changed: `StampSaveModal.tsx`, `public/help.html`
- New: this note, restore bat, snapshots
