@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-pdf-report-title\services\exportPdf.ts" (
  echo Backup not found: src.pre-pdf-report-title
  exit /b 1
)
copy /Y "src.pre-pdf-report-title\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-pdf-report-title\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored pdf-report-title rollback from src.pre-pdf-report-title
