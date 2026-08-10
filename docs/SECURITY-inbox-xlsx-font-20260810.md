# SECURITY — inbox Excel font size + 800 chip (2026-08-10)

## Change
- Collect inbox Excel modal chips: 180 / 240 / 320 / 480 / **800**.
- Font size presets: 작음(10pt) / 보통(11pt) / 큼(14pt) applied to the whole sheet; header stays bold.
- Stored in local `app_settings` (`project_inbox_excel_font_size`).
- `createStampsXlsx` accepts optional `fontSizePt` (clamped 8–18).
- Rollback: `restore-inbox-xlsx-font.bat`.

## Why
Large photos need an 800px chip; reviewers asked for readable cell text without a free-form number field.

## Security notes
- Local setting + export only; no new network calls or npm packages.
- Font preset whitelist (`small` | `normal` | `large`); pt derived in app code.
- GPL/OFL: unchanged (ExcelJS/system fonts only; no new font files).

## Patent note
Spreadsheet font sizing is routine; no patent-clearance claim.

## Files
- Changed: `exportXlsx.ts`, `projectCollectSettings.ts`, `ProjectCollectScreen.tsx`, `help.html`
- New: this note, `restore-inbox-xlsx-font.bat`, snapshots
