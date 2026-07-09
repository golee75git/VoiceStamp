@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-in-app-camera-zoom\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-in-app-camera-zoom
  exit /b 1
)
copy /Y "src.pre-in-app-camera-zoom\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
if exist "src\components\InAppCameraPreview.tsx" del /F "src\components\InAppCameraPreview.tsx"
copy /Y "src.pre-in-app-camera-zoom\help.html" "public\help.html"
copy /Y "src.pre-in-app-camera-zoom\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
echo Restored in-app-camera-zoom rollback from src.pre-in-app-camera-zoom
