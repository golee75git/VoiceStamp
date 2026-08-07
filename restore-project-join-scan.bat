@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-project-join-scan\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-project-join-scan\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "src.pre-project-join-scan\screens\MainScreen.tsx" "src\screens\MainScreen.tsx" >nul
if exist "public.pre-project-join-scan\help.html" copy /Y "public.pre-project-join-scan\help.html" "public\help.html" >nul
echo Restored project join QR scan. Reload Metro after restore.
endlocal
