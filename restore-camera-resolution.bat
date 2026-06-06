@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-resolution\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-resolution
  exit /b 1
)
copy /Y "src.pre-camera-resolution\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
if exist "src\utils\cameraPictureSize.ts" del "src\utils\cameraPictureSize.ts"
echo Restored camera resolution behavior from src.pre-camera-resolution
