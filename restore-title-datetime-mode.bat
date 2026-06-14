@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-title-datetime-mode\services\settingsService.ts" (
  echo Backup not found: src.pre-title-datetime-mode
  exit /b 1
)
copy /Y "src.pre-title-datetime-mode\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-title-datetime-mode\services\fileService.ts" "src\services\fileService.ts"
copy /Y "src.pre-title-datetime-mode\services\pdfTitleFormat.ts" "src\services\pdfTitleFormat.ts"
copy /Y "src.pre-title-datetime-mode\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-title-datetime-mode\App.tsx" "App.tsx"
if exist "src\services\titleDatetimeMode.ts" del /Q "src\services\titleDatetimeMode.ts"
echo Restored title datetime mode setting rollback (§105)
