@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-pdf-image-size\services\exportPdf.ts" (
  echo Backup not found: src.pre-pdf-image-size
  exit /b 1
)
copy /Y "src.pre-pdf-image-size\services\exportPdf.ts" "src\services\exportPdf.ts"
echo Restored pdf-image-size rollback from src.pre-pdf-image-size
