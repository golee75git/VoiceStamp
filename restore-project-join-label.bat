@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-project-join-label\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-project-join-label\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "src.pre-project-join-label\services\projectCollectSettings.ts" "src\services\projectCollectSettings.ts" >nul
copy /Y "src.pre-project-join-label\services\projectUploadQueue.ts" "src\services\projectUploadQueue.ts" >nul
copy /Y "src.pre-project-join-label\services\projectCollectApi.ts" "src\services\projectCollectApi.ts" >nul
if exist "api.pre-project-join-label\project.js" copy /Y "api.pre-project-join-label\project.js" "api\project.js" >nul
if exist "public.pre-project-join-label\help.html" copy /Y "public.pre-project-join-label\help.html" "public\help.html" >nul
echo Restored project join label. Redeploy Vercel if API was reverted. Reload Metro.
endlocal
