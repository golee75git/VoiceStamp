@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-hwpx-han-table\services\hwpxTemplate.ts" copy /Y "src.pre-hwpx-han-table\services\hwpxTemplate.ts" "src\services\hwpxTemplate.ts" >nul
if exist "scripts.pre-hwpx-han-table\build-report-template.mjs" copy /Y "scripts.pre-hwpx-han-table\build-report-template.mjs" "scripts\build-report-template.mjs" >nul
if exist "public.pre-hwpx-han-table\help.html" copy /Y "public.pre-hwpx-han-table\help.html" "public\help.html" >nul
if exist "public.pre-hwpx-han-table\templates\report.hwpx" copy /Y "public.pre-hwpx-han-table\templates\report.hwpx" "public\templates\report.hwpx" >nul
if exist "assets.pre-hwpx-han-table\templates\report.hwpx" copy /Y "assets.pre-hwpx-han-table\templates\report.hwpx" "assets\templates\report.hwpx" >nul
echo Restored HWPX hangul-table apply (paragraph fill + previous templates). Reload Metro.
endlocal
