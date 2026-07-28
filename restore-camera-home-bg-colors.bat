@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-home-bg-colors\services\settingsService.ts" (
  echo Backup not found: src.pre-camera-home-bg-colors
  exit /b 1
)
copy /Y "src.pre-camera-home-bg-colors\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-camera-home-bg-colors\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-camera-home-bg-colors\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "public.pre-camera-home-bg-colors\help.html" (
  copy /Y "public.pre-camera-home-bg-colors\help.html" "public\help.html"
)
if exist "assets.pre-camera-home-bg-colors\camera-home.png" (
  copy /Y "assets.pre-camera-home-bg-colors\camera-home.png" "assets\camera-home.png"
)
if exist "assets.pre-camera-home-bg-colors\camera-home-mainint1.png" (
  copy /Y "assets.pre-camera-home-bg-colors\camera-home-mainint1.png" "assets\camera-home-mainint1.png"
)
echo Restored camera home bg colors from src.pre-camera-home-bg-colors
