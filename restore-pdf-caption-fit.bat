@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-pdf-caption-fit\services\exportPdf.ts" (
  echo Backup not found: src.pre-pdf-caption-fit
  exit /b 1
)
copy /Y "src.pre-pdf-caption-fit\services\exportPdf.ts" "src\services\exportPdf.ts"
echo Restored pdf-caption-fit rollback from src.pre-pdf-caption-fit
