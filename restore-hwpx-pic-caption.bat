@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-hwpx-pic-caption\services\hwpxTemplate.ts" copy /Y "src.pre-hwpx-pic-caption\services\hwpxTemplate.ts" "src\services\hwpxTemplate.ts" >nul
if exist "scripts.pre-hwpx-pic-caption\build-report-template.mjs" copy /Y "scripts.pre-hwpx-pic-caption\build-report-template.mjs" "scripts\build-report-template.mjs" >nul
if exist "public.pre-hwpx-pic-caption\help.html" copy /Y "public.pre-hwpx-pic-caption\help.html" "public\help.html" >nul
if exist "public.pre-hwpx-pic-caption\templates\report.hwpx" copy /Y "public.pre-hwpx-pic-caption\templates\report.hwpx" "public\templates\report.hwpx" >nul
if exist "assets.pre-hwpx-pic-caption\templates\report.hwpx" copy /Y "assets.pre-hwpx-pic-caption\templates\report.hwpx" "assets\templates\report.hwpx" >nul
echo Restored HWPX photo-caption table fill (pre 2-row template apply). Reload Metro.
endlocal
