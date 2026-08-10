# SECURITY — save-screen collect join switch (2026-08-10)

## Change
- Phase 2: tap `취합전송 · {사업명}` on stamp save → join-history picker → confirm → `setProjectJoin` (same as hub 「다시 연결」).
- No switch UI when only one joined project remains.
- Rollback: `restore-collect-join-switch.bat` → `src.pre-collect-join-switch/` · `public.pre-collect-join-switch/`.

## Why
Field users with multiple joins can change upload target without leaving the save modal.

## Security notes
- Reuses existing local join history + `setProjectJoin` / `setProjectCollectEnabled`. No new APIs, secrets, or npm deps.
- Upload code stays on-device in the same settings store as before.
- Confirmation dialog required when leaving the active project (same pattern as ProjectCollect hub).
- GPL/OFL: no new libraries or fonts.

## Patent note
Local list selection + reconnect settings write is routine; no patent-clearance claim.

## Files
- Changed: `StampSaveModal.tsx`, `public/help.html`
- New: this note, restore bat, snapshots
