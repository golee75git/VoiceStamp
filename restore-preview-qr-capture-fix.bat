@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-preview-qr-capture-fix\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-preview-qr-capture-fix
  exit /b 1
)
copy /Y "src.pre-preview-qr-capture-fix\components\InAppCameraPreview.tsx" "src\components\InAppCameraPreview.tsx"
copy /Y "src.pre-preview-qr-capture-fix\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-preview-qr-capture-fix\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-preview-qr-capture-fix\services\quickCaptureSave.ts" "src\services\quickCaptureSave.ts"
if exist "public.pre-preview-qr-capture-fix\help.html" (
  copy /Y "public.pre-preview-qr-capture-fix\help.html" "public\help.html"
)
echo Restored preview-qr-capture-fix from src.pre-preview-qr-capture-fix / public.pre-preview-qr-capture-fix
endlocal
