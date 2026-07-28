@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-home-default-mainint1\services\settingsService.ts" (
  echo Backup not found: src.pre-camera-home-default-mainint1
  exit /b 1
)
copy /Y "src.pre-camera-home-default-mainint1\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-camera-home-default-mainint1\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-camera-home-default-mainint1\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "public.pre-camera-home-default-mainint1\help.html" (
  copy /Y "public.pre-camera-home-default-mainint1\help.html" "public\help.html"
)
echo Restored camera home default from src.pre-camera-home-default-mainint1
