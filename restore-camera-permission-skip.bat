@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-permission-skip\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-permission-skip
  exit /b 1
)
copy /Y "src.pre-camera-permission-skip\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
if exist "src.pre-camera-permission-skip\help.html" (
  copy /Y "src.pre-camera-permission-skip\help.html" "public\help.html"
)
echo Restored CameraScreen.tsx from src.pre-camera-permission-skip
