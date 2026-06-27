@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-busy-overlay\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-busy-overlay
  exit /b 1
)
copy /Y "src.pre-camera-busy-overlay\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored camera busy overlay fix rollback
