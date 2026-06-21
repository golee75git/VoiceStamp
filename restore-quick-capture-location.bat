@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-quick-capture-location\services\quickCaptureSave.ts" (
  echo Backup not found: src.pre-quick-capture-location
  exit /b 1
)
copy /Y "src.pre-quick-capture-location\services\quickCaptureSave.ts" "src\services\quickCaptureSave.ts"
copy /Y "src.pre-quick-capture-location\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
echo Restored quick capture location reuse rollback (§111)
