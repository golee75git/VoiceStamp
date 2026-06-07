@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-pdf-align\services\exportPdf.ts" (
  echo Backup not found: src.pre-pdf-align
  exit /b 1
)
copy /Y "src.pre-pdf-align\services\exportPdf.ts" "src\services\exportPdf.ts"
echo Restored pdf-align rollback from src.pre-pdf-align
