@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-owned-close-invite\services\projectCollectSettings.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-owned-close-invite\services\projectCollectSettings.ts" "src\services\projectCollectSettings.ts" >nul
copy /Y "src.pre-owned-close-invite\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "public.pre-owned-close-invite\help.html" copy /Y "public.pre-owned-close-invite\help.html" "public\help.html" >nul
echo Restored owned close/invite. Reload Metro.
endlocal
