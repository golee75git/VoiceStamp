@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-pdf-save\services\exportPdf.ts" (
  echo Backup not found: src.pre-pdf-save
  exit /b 1
)
copy /Y "src.pre-pdf-save\services\exportPdf.ts" "src\services\exportPdf.ts"
echo Restored PDF save behavior from src.pre-pdf-save
