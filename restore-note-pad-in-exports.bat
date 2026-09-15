@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-note-pad-in-exports\services\exportPdf.ts" copy /Y "src.pre-note-pad-in-exports\services\exportPdf.ts" "src\services\exportPdf.ts" >nul
if exist "src.pre-note-pad-in-exports\services\exportHwpx.ts" copy /Y "src.pre-note-pad-in-exports\services\exportHwpx.ts" "src\services\exportHwpx.ts" >nul
if exist "src.pre-note-pad-in-exports\services\pdfImageForExport.ts" copy /Y "src.pre-note-pad-in-exports\services\pdfImageForExport.ts" "src\services\pdfImageForExport.ts" >nul
echo Restored note-pad-in-exports (before photo note pad text was baked into PDF/HWPX exports). Reload Metro.
endlocal
