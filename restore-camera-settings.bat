@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-settings\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-settings
  exit /b 1
)
copy /Y "src.pre-camera-settings\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-camera-settings\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-camera-settings\screens\MainScreen.tsx" "src\screens\MainScreen.tsx"
echo Restored camera settings button from src.pre-camera-settings
