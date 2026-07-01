@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-post-capture-busy\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-post-capture-busy
  exit /b 1
)
copy /Y "src.pre-post-capture-busy\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored post-capture-busy CameraScreen rollback
