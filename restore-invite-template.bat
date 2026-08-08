@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-invite-template\services\projectJoinLink.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-invite-template\services\projectJoinLink.ts" "src\services\projectJoinLink.ts" >nul
copy /Y "src.pre-invite-template\services\projectCollectSettings.ts" "src\services\projectCollectSettings.ts" >nul
copy /Y "src.pre-invite-template\services\projectCollectApi.ts" "src\services\projectCollectApi.ts" >nul
copy /Y "src.pre-invite-template\services\projectUploadQueue.ts" "src\services\projectUploadQueue.ts" >nul
copy /Y "src.pre-invite-template\services\projectImportService.ts" "src\services\projectImportService.ts" >nul
copy /Y "src.pre-invite-template\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts" >nul
copy /Y "src.pre-invite-template\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "src\services\projectInviteTemplate.ts" del /F /Q "src\services\projectInviteTemplate.ts" >nul 2>&1
if exist "api.pre-invite-template\project.js" copy /Y "api.pre-invite-template\project.js" "api\project.js" >nul
if exist "public.pre-invite-template\help.html" copy /Y "public.pre-invite-template\help.html" "public\help.html" >nul
echo Restored invite template. Reload Metro / redeploy API if needed.
endlocal
