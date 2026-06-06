@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-pdf-per-page\services\exportPdf.ts" (
  echo Backup not found: src.pre-pdf-per-page
  exit /b 1
)
copy /Y "src.pre-pdf-per-page\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-pdf-per-page\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-pdf-per-page\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
echo Restored PDF per-page settings from src.pre-pdf-per-page
