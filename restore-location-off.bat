@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-location-off\services\settingsService.ts" (
  echo Backup not found: src.pre-location-off
  exit /b 1
)
copy /Y "src.pre-location-off\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-location-off\services\locationService.ts" "src\services\locationService.ts"
copy /Y "src.pre-location-off\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-location-off\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-location-off\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
echo Restored location-off setting rollback from src.pre-location-off
