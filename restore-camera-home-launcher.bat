@echo off
setlocal
if not exist "src.pre-camera-home-launcher\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-home-launcher
  exit /b 1
)
copy /Y "src.pre-camera-home-launcher\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
if exist "src.pre-camera-home-launcher\camera-home.png" (
  copy /Y "src.pre-camera-home-launcher\camera-home.png" "assets\camera-home.png"
)
echo Restored CameraScreen.tsx and camera-home.png from src.pre-camera-home-launcher
echo Note: assets/list-icon.png is not removed.
