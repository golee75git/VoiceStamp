@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-ncp-project-qr\services\saveStamp.ts" (
  echo Backup not found: src.pre-ncp-project-qr
  exit /b 1
)
xcopy /E /I /Y "src.pre-ncp-project-qr\*" "src\" >nul
if exist "public.pre-ncp-project-qr\help.html" (
  copy /Y "public.pre-ncp-project-qr\help.html" "public\help.html"
)
if exist "api.pre-ncp-project-qr" (
  xcopy /E /I /Y "api.pre-ncp-project-qr\*" "api\" >nul
)
if exist "src\components\ProjectCollectScreen.tsx" (
  del /F /Q "src\components\ProjectCollectScreen.tsx"
)
if exist "src\services\projectCollectSettings.ts" (
  del /F /Q "src\services\projectCollectSettings.ts"
)
if exist "src\services\projectCollectApi.ts" (
  del /F /Q "src\services\projectCollectApi.ts"
)
if exist "src\services\projectUploadQueue.ts" (
  del /F /Q "src\services\projectUploadQueue.ts"
)
if exist "src\services\projectImportService.ts" (
  del /F /Q "src\services\projectImportService.ts"
)
if exist "api\project.js" (
  del /F /Q "api\project.js"
)
echo Restored ncp-project-qr from snapshots
endlocal
