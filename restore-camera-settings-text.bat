@echo off
setlocal
if not exist "src.pre-camera-settings-text\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-settings-text
  exit /b 1
)
copy /Y "src.pre-camera-settings-text\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored CameraScreen.tsx from src.pre-camera-settings-text
