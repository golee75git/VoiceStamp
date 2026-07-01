@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-location-fast-sheet\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-location-fast-sheet
  exit /b 1
)
copy /Y "src.pre-location-fast-sheet\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored location fast-sheet prefetch rollback
