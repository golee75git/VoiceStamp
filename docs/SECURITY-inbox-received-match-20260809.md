# SECURITY — inbox received+projectId match (2026-08-09)

## Change
- `markStampReceivedFromProject` now stores `projectId` with status `received` (same upload-status map as sent uploads).
- Inbox / imported lists resolve local rows by `received` + `projectId`, with path fallback that also matches disk folder names after `sanitizeStampFileBaseName` (spaces → `_`).
- Rollback: `restore-inbox-received-match.bat` → `src.pre-inbox-received-match/` · `public.pre-inbox-received-match/`.

## Why
After 「내 폰으로」 with delete-after-import ON, remote rows disappear. Path-only merge failed when project names had spaces (e.g. `2026.8.9 강릉초`) because save and list used different sanitizers.

## Security notes
- Local device settings only; no new network fields or secrets.
- `projectId` already used for sent-stamp records; received marks reuse the same bounded JSON map (cap unchanged).
- No new npm dependencies. No font changes (existing UI fonts only).
- GPL / OFL: no new libraries or font assets.

## Patent note
Record-lookup and path string matching are routine app patterns; no patent-clearance claim is made.

## Files
- Changed: `projectCollectSettings.ts`, `projectImportedStamps.ts`, `projectImportService.ts`, `ProjectCollectScreen.tsx`, `ProjectImportedList.tsx`, `public/help.html`
- New: this SECURITY note, restore bat, snapshots
