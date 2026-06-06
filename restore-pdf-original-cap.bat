@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-pdf-original-cap\services\pdfImageForExport.ts" (
  echo Backup not found: src.pre-pdf-original-cap
  exit /b 1
)
copy /Y "src.pre-pdf-original-cap\services\pdfImageForExport.ts" "src\services\pdfImageForExport.ts"
echo Restored PDF original cap rollback from src.pre-pdf-original-cap
