@echo off
cd /d "%~dp0"
if not exist "src.pre-pdf" (
  echo ERROR: src.pre-pdf backup not found.
  exit /b 1
)
copy /Y "src.pre-pdf\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "src.pre-pdf\services\exportPdf.ts" (
  copy /Y "src.pre-pdf\services\exportPdf.ts" "src\services\exportPdf.ts" >nul
) else (
  del "src\services\exportPdf.ts" 2>nul
)
copy /Y "package.json.pre-pdf" "package.json" >nul
call npm install
echo Restored PDF feature files
