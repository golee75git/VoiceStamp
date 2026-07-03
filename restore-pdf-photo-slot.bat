@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-pdf-photo-slot\services\exportPdf.ts" (
  echo Backup not found: src.pre-pdf-photo-slot
  exit /b 1
)
copy /Y "src.pre-pdf-photo-slot\services\exportPdf.ts" "src\services\exportPdf.ts"
echo Restored pdf-photo-slot rollback from src.pre-pdf-photo-slot
