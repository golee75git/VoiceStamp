@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-inapp-preview-fit\components\InAppCameraPreview.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-inapp-preview-fit\components\InAppCameraPreview.tsx" "src\components\InAppCameraPreview.tsx" >nul
copy /Y "src.pre-inapp-preview-fit\utils\cameraPictureSize.ts" "src\utils\cameraPictureSize.ts" >nul
if exist "public.pre-inapp-preview-fit\help.html" copy /Y "public.pre-inapp-preview-fit\help.html" "public\help.html" >nul
echo Restored in-app preview fit. Reload Metro.
endlocal
