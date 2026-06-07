@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-nav\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-camera-nav
  exit /b 1
)
copy /Y "src.pre-camera-nav\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-camera-nav\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-camera-nav\screens\MainScreen.tsx" "src\screens\MainScreen.tsx"
echo Restored camera-nav rollback from src.pre-camera-nav
