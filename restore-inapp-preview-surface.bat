@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-inapp-preview-surface\components\InAppCameraPreview.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-inapp-preview-surface\components\InAppCameraPreview.tsx" "src\components\InAppCameraPreview.tsx" >nul
echo Restored in-app preview surface. Reload Metro.
endlocal
