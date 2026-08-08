@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-join-history\services\projectCollectSettings.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-join-history\services\projectCollectSettings.ts" "src\services\projectCollectSettings.ts" >nul
copy /Y "src.pre-join-history\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "public.pre-join-history\help.html" copy /Y "public.pre-join-history\help.html" "public\help.html" >nul
echo Restored join history. Reload Metro.
endlocal
