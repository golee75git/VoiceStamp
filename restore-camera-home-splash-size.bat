@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-home-splash-size\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-home-splash-size
  exit /b 1
)
copy /Y "src.pre-camera-home-splash-size\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored CameraScreen.tsx from src.pre-camera-home-splash-size
