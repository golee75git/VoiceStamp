@echo off
setlocal
if not exist "src.pre-camera-home-image\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-home-image
  exit /b 1
)
copy /Y "src.pre-camera-home-image\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored CameraScreen.tsx from src.pre-camera-home-image
echo Note: assets/camera-home.png is not removed.
