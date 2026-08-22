@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-save-modal-image\components\StampSaveModal.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-save-modal-image\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
copy /Y "src.pre-save-modal-image\services\saveStamp.ts" "src\services\saveStamp.ts" >nul
if exist "public.pre-save-modal-image\help.html" copy /Y "public.pre-save-modal-image\help.html" "public\help.html" >nul
echo Restored save-modal image. Reload Metro.
endlocal
