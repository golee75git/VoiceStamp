@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-hwpx-han-mark\services\exportHwpx.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-hwpx-han-mark\services\exportHwpx.ts" "src\services\exportHwpx.ts" >nul
copy /Y "scripts.pre-hwpx-han-mark\build-report-template.mjs" "scripts\build-report-template.mjs" >nul
copy /Y "scripts.pre-hwpx-han-mark\inspect-hwpx.mjs" "scripts\inspect-hwpx.mjs" >nul
if exist "assets.pre-hwpx-han-mark\templates\report.hwpx" copy /Y "assets.pre-hwpx-han-mark\templates\report.hwpx" "assets\templates\report.hwpx" >nul
if exist "assets.pre-hwpx-han-mark\templates\vs-form.hwpx" copy /Y "assets.pre-hwpx-han-mark\templates\vs-form.hwpx" "assets\templates\vs-form.hwpx" >nul
if exist "public.pre-hwpx-han-mark\templates\report.hwpx" copy /Y "public.pre-hwpx-han-mark\templates\report.hwpx" "public\templates\report.hwpx" >nul
if exist "public.pre-hwpx-han-mark\help.html" copy /Y "public.pre-hwpx-han-mark\help.html" "public\help.html" >nul
if exist "docs.pre-hwpx-han-mark-LICENSE-NOTICE.md" copy /Y "docs.pre-hwpx-han-mark-LICENSE-NOTICE.md" "docs\LICENSE-NOTICE.md" >nul
echo Restored previous HWPX hangul-mark wiring. Reload Metro.
endlocal
