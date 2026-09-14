@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-hwpx-caption-blob\services\hwpxTemplate.ts" copy /Y "src.pre-hwpx-caption-blob\services\hwpxTemplate.ts" "src\services\hwpxTemplate.ts" >nul
if exist "src.pre-hwpx-caption-blob\services\exportHwpx.ts" copy /Y "src.pre-hwpx-caption-blob\services\exportHwpx.ts" "src\services\exportHwpx.ts" >nul
if exist "scripts.pre-hwpx-caption-blob\build-report-template.mjs" copy /Y "scripts.pre-hwpx-caption-blob\build-report-template.mjs" "scripts\build-report-template.mjs" >nul
if exist "public.pre-hwpx-caption-blob\help.html" copy /Y "public.pre-hwpx-caption-blob\help.html" "public\help.html" >nul
if exist "public.pre-hwpx-caption-blob\templates\report.hwpx" copy /Y "public.pre-hwpx-caption-blob\templates\report.hwpx" "public\templates\report.hwpx" >nul
if exist "assets.pre-hwpx-caption-blob\templates\report.hwpx" copy /Y "assets.pre-hwpx-caption-blob\templates\report.hwpx" "assets\templates\report.hwpx" >nul
echo Restored HWPX caption-blob fill (pre 1-cell Hangul table apply). Reload Metro.
endlocal
