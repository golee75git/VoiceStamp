# SECURITY — inbox Excel preview width px (2026-08-10)

## Change
- Collect inbox / hub Excel export asks for preview image width in px (120–800, default 240) before building the file.
- Value is stored in local `app_settings` (`project_inbox_excel_preview_width`).
- `createStampsXlsx` accepts optional `previewWidthPx`; stamp-list XLSX unchanged (still 120×90 default).
- Rollback: `restore-inbox-xlsx-preview-px.bat`.

## Why
Embedded Excel thumbnails were fixed at 120×90 and looked too small for received-photo review.

## Security notes
- Local setting + export only; no new network or npm dependencies.
- Width clamped server-side in sanitizer (client input digits only).
- GPL/OFL: unchanged.

## Patent note
Spreadsheet image sizing is routine; no patent-clearance claim.

## Files
- Changed: `exportXlsx.ts`, `projectCollectSettings.ts`, `ProjectCollectScreen.tsx`, `help.html`
- New: this note, restore bat, snapshots
