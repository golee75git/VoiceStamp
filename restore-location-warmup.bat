@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-location-warmup\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-location-warmup
  exit /b 1
)
copy /Y "src.pre-location-warmup\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-location-warmup\components\CaptureActionSheet.tsx" "src\components\CaptureActionSheet.tsx"
copy /Y "src.pre-location-warmup\services\locationService.ts" "src\services\locationService.ts"
echo Restored location warmup rollback
