@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-nav-button-size\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-nav-button-size
  exit /b 1
)
copy /Y "src.pre-nav-button-size\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored nav-button-size rollback from src.pre-nav-button-size
