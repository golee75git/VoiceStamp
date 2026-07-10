@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-shutter-sound\services\settingsService.ts" (
  echo Backup not found: src.pre-shutter-sound
  exit /b 1
)
copy /Y "src.pre-shutter-sound\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-shutter-sound\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-shutter-sound\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-shutter-sound\help.html" "public\help.html"
echo Restored shutter-sound rollback from src.pre-shutter-sound
