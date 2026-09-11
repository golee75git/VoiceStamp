@echo off
REM Restore HWPX page-count layout before PDF photos-per-page follow (2026-09-11).
copy /Y "src.pre-hwpx-page-count\services\exportHwpx.ts" "src\services\exportHwpx.ts"
copy /Y "src.pre-hwpx-page-count\services\hwpxTemplate.ts" "src\services\hwpxTemplate.ts"
copy /Y "src.pre-hwpx-page-count\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-hwpx-page-count\public\help.html" "public\help.html"
echo Restored HWPX page-count files from src.pre-hwpx-page-count
pause
