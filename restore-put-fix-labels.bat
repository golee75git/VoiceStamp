@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-put-fix-labels\services\projectUploadQueue.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-put-fix-labels\services\projectUploadQueue.ts" "src\services\projectUploadQueue.ts" >nul
copy /Y "src.pre-put-fix-labels\services\projectCollectApi.ts" "src\services\projectCollectApi.ts" >nul
copy /Y "src.pre-put-fix-labels\services\exportXlsx.ts" "src\services\exportXlsx.ts" >nul
copy /Y "src.pre-put-fix-labels\services\projectImportService.ts" "src\services\projectImportService.ts" >nul
if exist "api.pre-put-fix-labels\project.js" copy /Y "api.pre-put-fix-labels\project.js" "api\project.js" >nul
if exist "public.pre-put-fix-labels\help.html" copy /Y "public.pre-put-fix-labels\help.html" "public\help.html" >nul
echo Restored put-fix-labels. Redeploy API if needed.
endlocal
