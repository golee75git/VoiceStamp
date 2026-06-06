@echo off
cd /d "%~dp0"
if not exist "src.pre-pdf-name\components\StampListScreen.tsx" (
  echo ERROR: src.pre-pdf-name backup not found.
  exit /b 1
)
copy /Y "src.pre-pdf-name\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
copy /Y "src.pre-pdf-name\services\exportPdf.ts" "src\services\exportPdf.ts" >nul
echo Restored PDF filename feature files
