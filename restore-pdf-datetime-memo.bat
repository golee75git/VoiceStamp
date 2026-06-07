@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-pdf-datetime-memo\services\exportPdf.ts" (
  echo Backup not found: src.pre-pdf-datetime-memo
  exit /b 1
)
copy /Y "src.pre-pdf-datetime-memo\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-pdf-datetime-memo\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-pdf-datetime-memo\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-pdf-datetime-memo\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src\services\pdfTitleFormat.ts" del /Q "src\services\pdfTitleFormat.ts"
echo Restored pdf-datetime-memo rollback from src.pre-pdf-datetime-memo
