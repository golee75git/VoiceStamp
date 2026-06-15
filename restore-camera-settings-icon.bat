@echo off
setlocal
if not exist "src.pre-camera-settings-icon\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-settings-icon
  exit /b 1
)
copy /Y "src.pre-camera-settings-icon\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored CameraScreen.tsx from src.pre-camera-settings-icon
echo Note: assets/settings-icon.png is not removed.
