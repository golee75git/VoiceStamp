@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-hub-card-status\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-hub-card-status\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "public.pre-hub-card-status\help.html" copy /Y "public.pre-hub-card-status\help.html" "public\help.html" >nul
echo Restored hub card status tints. Reload Metro.
endlocal
