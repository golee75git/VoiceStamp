@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-pdf-quality\services\settingsService.ts" (
  echo Backup not found: src.pre-pdf-quality
  exit /b 1
)
copy /Y "src.pre-pdf-quality\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-pdf-quality\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-pdf-quality\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-pdf-quality\package.json" "package.json"
if exist "src\services\pdfImageForExport.ts" del "src\services\pdfImageForExport.ts"
echo Restored PDF quality settings from src.pre-pdf-quality
echo Run: npm install
