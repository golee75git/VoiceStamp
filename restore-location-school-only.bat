@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-location-school-only\services\locationService.ts" (
  echo Backup not found: src.pre-location-school-only
  exit /b 1
)
copy /Y "src.pre-location-school-only\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-location-school-only\services\locationService.ts" "src\services\locationService.ts"
copy /Y "src.pre-location-school-only\services\quickCaptureSave.ts" "src\services\quickCaptureSave.ts"
copy /Y "src.pre-location-school-only\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-location-school-only\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-location-school-only\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src.pre-location-school-only\help.html" copy /Y "src.pre-location-school-only\help.html" "public\help.html"
echo Restored location school-only (off = last place)
