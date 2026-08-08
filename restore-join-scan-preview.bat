@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-join-scan-preview\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-join-scan-preview\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "public.pre-join-scan-preview\help.html" copy /Y "public.pre-join-scan-preview\help.html" "public\help.html" >nul
echo Restored join QR scan preview layout. Reload Metro after restore.
endlocal
