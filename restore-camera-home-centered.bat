@echo off
setlocal
if not exist "src.pre-camera-home-centered\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-home-centered
  exit /b 1
)
copy /Y "src.pre-camera-home-centered\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored CameraScreen.tsx from src.pre-camera-home-centered
