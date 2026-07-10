@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-zoom-presets\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-zoom-presets
  exit /b 1
)
copy /Y "src.pre-camera-zoom-presets\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-camera-zoom-presets\components\InAppCameraPreview.tsx" "src\components\InAppCameraPreview.tsx"
copy /Y "src.pre-camera-zoom-presets\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-camera-zoom-presets\help.html" "public\help.html"
echo Restored camera-zoom-presets rollback from src.pre-camera-zoom-presets
