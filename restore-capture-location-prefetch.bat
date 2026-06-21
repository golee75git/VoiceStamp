@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-capture-location-prefetch\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-capture-location-prefetch
  exit /b 1
)
copy /Y "src.pre-capture-location-prefetch\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-capture-location-prefetch\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-capture-location-prefetch\components\CaptureActionSheet.tsx" "src\components\CaptureActionSheet.tsx"
echo Restored capture location prefetch rollback
