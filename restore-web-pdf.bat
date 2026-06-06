@echo off
cd /d "%~dp0"
if not exist "src.pre-web-pdf\services\exportPdf.ts" (
  echo ERROR: src.pre-web-pdf backup not found.
  exit /b 1
)
copy /Y "src.pre-web-pdf\services\exportPdf.ts" "src\services\exportPdf.ts" >nul
echo Restored web PDF print files
