@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-hwpx-own-form\services\exportHwpx.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-hwpx-own-form\services\exportHwpx.ts" "src\services\exportHwpx.ts" >nul
copy /Y "scripts.pre-hwpx-own-form\build-report-template.mjs" "scripts\build-report-template.mjs" >nul
copy /Y "scripts.pre-hwpx-own-form\inspect-hwpx.mjs" "scripts\inspect-hwpx.mjs" >nul
if exist "assets.pre-hwpx-own-form\templates\report.hwpx" copy /Y "assets.pre-hwpx-own-form\templates\report.hwpx" "assets\templates\report.hwpx" >nul
if exist "assets.pre-hwpx-own-form\templates\report-source.hwpx" copy /Y "assets.pre-hwpx-own-form\templates\report-source.hwpx" "assets\templates\report-source.hwpx" >nul
if exist "public.pre-hwpx-own-form\templates\report.hwpx" copy /Y "public.pre-hwpx-own-form\templates\report.hwpx" "public\templates\report.hwpx" >nul
if exist "public.pre-hwpx-own-form\help.html" copy /Y "public.pre-hwpx-own-form\help.html" "public\help.html" >nul
if exist "docs.pre-hwpx-own-form-LICENSE-NOTICE.md" copy /Y "docs.pre-hwpx-own-form-LICENSE-NOTICE.md" "docs\LICENSE-NOTICE.md" >nul
if exist "docs.pre-hwpx-own-form\SECURITY-play-readiness-20260811.md" copy /Y "docs.pre-hwpx-own-form\SECURITY-play-readiness-20260811.md" "docs\SECURITY-play-readiness-20260811.md" >nul
if exist "assets\templates\vs-form.hwpx" del /Q "assets\templates\vs-form.hwpx"
echo Restored HWPX scripts, export path, help, and license notes.
echo Third-party HWPX binaries are not in git; copy from assets.pre-hwpx-own-form\templates if that folder still exists locally.
endlocal
