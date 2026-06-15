@echo off
setlocal
if not exist "src.pre-hwpx-template\services\exportHwpx.ts" (
  echo Backup not found: src.pre-hwpx-template
  exit /b 1
)
copy /Y "src.pre-hwpx-template\services\exportHwpx.ts" "src\services\exportHwpx.ts"
if exist "src.pre-hwpx-template\metro.config.js" copy /Y "src.pre-hwpx-template\metro.config.js" "metro.config.js"
if exist "src.pre-hwpx-template\package.json" copy /Y "src.pre-hwpx-template\package.json" "package.json"
if exist "src\services\hwpxTemplate.ts" del /Q "src\services\hwpxTemplate.ts"
echo Restored HWPX export before template-based renderer.
echo Note: assets/templates/report.hwpx and public/templates/report.hwpx are kept.
