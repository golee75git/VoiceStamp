@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-hwpx-reapply-1cell\services\hwpxTemplate.ts" copy /Y "src.pre-hwpx-reapply-1cell\services\hwpxTemplate.ts" "src\services\hwpxTemplate.ts" >nul
if exist "src.pre-hwpx-reapply-1cell\services\exportHwpx.ts" copy /Y "src.pre-hwpx-reapply-1cell\services\exportHwpx.ts" "src\services\exportHwpx.ts" >nul
if exist "scripts.pre-hwpx-reapply-1cell\build-report-template.mjs" copy /Y "scripts.pre-hwpx-reapply-1cell\build-report-template.mjs" "scripts\build-report-template.mjs" >nul
if exist "public.pre-hwpx-reapply-1cell\help.html" copy /Y "public.pre-hwpx-reapply-1cell\help.html" "public\help.html" >nul
if exist "public.pre-hwpx-reapply-1cell\templates\report.hwpx" copy /Y "public.pre-hwpx-reapply-1cell\templates\report.hwpx" "public\templates\report.hwpx" >nul
if exist "assets.pre-hwpx-reapply-1cell\templates\report.hwpx" copy /Y "assets.pre-hwpx-reapply-1cell\templates\report.hwpx" "assets\templates\report.hwpx" >nul
if exist "public.pre-hwpx-reapply-1cell\vercel.json" copy /Y "public.pre-hwpx-reapply-1cell\vercel.json" "vercel.json" >nul
echo Restored HWPX 1-cell reapply (pre latest Hangul report.hwpx). Reload Metro.
endlocal
