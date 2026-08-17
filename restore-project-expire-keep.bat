@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-project-expire-keep\services\projectCollectSettings.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-project-expire-keep\services\projectCollectSettings.ts" "src\services\projectCollectSettings.ts" >nul
copy /Y "src.pre-project-expire-keep\services\projectCollectApi.ts" "src\services\projectCollectApi.ts" >nul
copy /Y "src.pre-project-expire-keep\services\projectUploadQueue.ts" "src\services\projectUploadQueue.ts" >nul
copy /Y "src.pre-project-expire-keep\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "src.pre-project-expire-keep\components\CameraScreen.tsx" "src\components\CameraScreen.tsx" >nul
if exist "src\services\joinEndedNotice.ts" del /Q "src\services\joinEndedNotice.ts"
if exist "public.pre-project-expire-keep\help.html" copy /Y "public.pre-project-expire-keep\help.html" "public\help.html" >nul
if exist "public.pre-project-expire-keep\privacy.html" copy /Y "public.pre-project-expire-keep\privacy.html" "public\privacy.html" >nul
if exist "docs.pre-project-expire-keep\PRIVACY.md" copy /Y "docs.pre-project-expire-keep\PRIVACY.md" "docs\PRIVACY.md" >nul
echo Restored project expire keep. Reload Metro.
endlocal
