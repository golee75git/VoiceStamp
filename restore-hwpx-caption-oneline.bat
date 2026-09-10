@echo off
REM Restore HWPX caption fill before one-line · join fix (2026-09-10).
copy /Y "src.pre-hwpx-caption-oneline\services\exportHwpx.ts" "src\services\exportHwpx.ts"
copy /Y "src.pre-hwpx-caption-oneline\public\help.html" "public\help.html"
echo Restored exportHwpx.ts and help.html from src.pre-hwpx-caption-oneline
pause
