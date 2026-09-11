@echo off
REM Restore HWPX fill before photo-on-top table (2026-09-11).
copy /Y "src.pre-hwpx-table\services\exportHwpx.ts" "src\services\exportHwpx.ts"
copy /Y "src.pre-hwpx-table\services\hwpxTemplate.ts" "src\services\hwpxTemplate.ts"
copy /Y "src.pre-hwpx-table\public\help.html" "public\help.html"
echo Restored HWPX table-layout files from src.pre-hwpx-table
pause
