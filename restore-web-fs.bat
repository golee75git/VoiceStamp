@echo off
cd /d "%~dp0"
if not exist "src.pre-web-fs\services\fileService.ts" (
  echo ERROR: src.pre-web-fs backup not found.
  exit /b 1
)
copy /Y "src.pre-web-fs\services\fileService.ts" "src\services\fileService.ts" >nul
copy /Y "src.pre-web-fs\services\exportPdf.ts" "src\services\exportPdf.ts" >nul
echo Restored web file storage files
