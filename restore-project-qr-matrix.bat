@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-project-qr-matrix\components\ProjectCollectScreen.tsx" (
  echo Backup not found: src.pre-project-qr-matrix
  exit /b 1
)
copy /Y "src.pre-project-qr-matrix\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "public.pre-project-qr-matrix\help.html" (
  copy /Y "public.pre-project-qr-matrix\help.html" "public\help.html" >nul
)
echo Restored ProjectCollectScreen QR rendering from src.pre-project-qr-matrix
echo Rebuild APK / Metro reload after restore.
endlocal
