@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-home-bg\services\settingsService.ts" (
  echo Backup not found: src.pre-camera-home-bg
  exit /b 1
)
copy /Y "src.pre-camera-home-bg\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-camera-home-bg\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-camera-home-bg\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
if exist "public.pre-camera-home-bg\help.html" (
  copy /Y "public.pre-camera-home-bg\help.html" "public\help.html"
)
echo Restored camera home bg setting from src.pre-camera-home-bg
echo Note: assets\camera-home-mainint1.png may remain; remove manually if unused.
