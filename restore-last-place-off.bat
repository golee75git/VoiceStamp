@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-last-place-off\services\settingsService.ts" (
  echo Backup not found: src.pre-last-place-off
  exit /b 1
)
copy /Y "src.pre-last-place-off\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-last-place-off\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-last-place-off\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-last-place-off\help.html" "public\help.html"
echo Restored last-place-off rollback from src.pre-last-place-off
