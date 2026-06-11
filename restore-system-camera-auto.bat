@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-system-camera-auto\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-system-camera-auto
  exit /b 1
)
copy /Y "src.pre-system-camera-auto\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored system-camera-auto rollback from src.pre-system-camera-auto
