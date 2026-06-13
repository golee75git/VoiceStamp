@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-web-camera\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-web-camera
  exit /b 1
)
copy /Y "src.pre-web-camera\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored web camera from src.pre-web-camera
