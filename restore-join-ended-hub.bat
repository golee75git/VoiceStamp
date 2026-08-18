@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-join-ended-hub\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-join-ended-hub\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "src.pre-join-ended-hub\services\projectCollectSettings.ts" "src\services\projectCollectSettings.ts" >nul
copy /Y "src.pre-join-ended-hub\services\joinEndedNotice.ts" "src\services\joinEndedNotice.ts" >nul
if exist "public.pre-join-ended-hub\help.html" copy /Y "public.pre-join-ended-hub\help.html" "public\help.html" >nul
echo Restored join ended hub. Reload Metro.
endlocal
