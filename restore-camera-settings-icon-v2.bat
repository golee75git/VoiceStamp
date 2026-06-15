@echo off
setlocal
if not exist "src.pre-camera-settings-icon-v2\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-settings-icon-v2
  exit /b 1
)
copy /Y "src.pre-camera-settings-icon-v2\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
if exist "src.pre-camera-settings-icon-v2\settings-icon.png" (
  copy /Y "src.pre-camera-settings-icon-v2\settings-icon.png" "assets\settings-icon.png"
)
echo Restored CameraScreen.tsx and settings-icon.png from src.pre-camera-settings-icon-v2
