@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "src.pre-collect-save-feedback\components\ProjectCollectScreen.tsx" (
  echo [ERROR] Missing snapshot
  exit /b 1
)

copy /Y "src.pre-collect-save-feedback\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "src.pre-collect-save-feedback\components\CameraScreen.tsx" "src\components\CameraScreen.tsx" >nul
copy /Y "src.pre-collect-save-feedback\services\projectUploadQueue.ts" "src\services\projectUploadQueue.ts" >nul
copy /Y "src.pre-collect-save-feedback\services\saveStamp.ts" "src\services\saveStamp.ts" >nul
if exist "public.pre-collect-save-feedback\help.html" copy /Y "public.pre-collect-save-feedback\help.html" "public\help.html" >nul
if exist "public.pre-collect-save-feedback\join.html" copy /Y "public.pre-collect-save-feedback\join.html" "public\join.html" >nul
if exist "src\services\projectUploadFeedback.ts" del /Q "src\services\projectUploadFeedback.ts"

echo Restored collect-save-feedback from *.pre-collect-save-feedback
exit /b 0
