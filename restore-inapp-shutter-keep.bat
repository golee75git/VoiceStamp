@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-inapp-shutter-keep\components\CameraScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-inapp-shutter-keep\components\CameraScreen.tsx" "src\components\CameraScreen.tsx" >nul
copy /Y "src.pre-inapp-shutter-keep\components\InAppCameraPreview.tsx" "src\components\InAppCameraPreview.tsx" >nul
if exist "public.pre-inapp-shutter-keep\help.html" copy /Y "public.pre-inapp-shutter-keep\help.html" "public\help.html" >nul
echo Restored in-app shutter keep. Reload Metro.
endlocal
