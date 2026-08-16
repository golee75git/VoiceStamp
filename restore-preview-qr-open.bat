@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-preview-qr-open\components\InAppCameraPreview.tsx" (
  echo Backup not found: src.pre-preview-qr-open
  exit /b 1
)
copy /Y "src.pre-preview-qr-open\components\InAppCameraPreview.tsx" "src\components\InAppCameraPreview.tsx"
copy /Y "src.pre-preview-qr-open\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
if exist "public.pre-preview-qr-open\help.html" (
  copy /Y "public.pre-preview-qr-open\help.html" "public\help.html"
)
echo Restored preview-qr-open from src.pre-preview-qr-open / public.pre-preview-qr-open
endlocal
