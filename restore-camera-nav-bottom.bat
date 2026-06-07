@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-nav-bottom\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-nav-bottom
  exit /b 1
)
copy /Y "src.pre-camera-nav-bottom\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored camera-nav-bottom rollback from src.pre-camera-nav-bottom
