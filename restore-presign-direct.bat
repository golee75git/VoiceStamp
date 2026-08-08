@echo off
setlocal
cd /d "%~dp0"
if not exist "api.pre-presign-direct\project.js" (
  echo Backup not found
  exit /b 1
)
copy /Y "api.pre-presign-direct\project.js" "api\project.js" >nul
copy /Y "src.pre-presign-direct\services\projectCollectApi.ts" "src\services\projectCollectApi.ts" >nul
copy /Y "src.pre-presign-direct\services\projectUploadQueue.ts" "src\services\projectUploadQueue.ts" >nul
copy /Y "src.pre-presign-direct\services\projectImportService.ts" "src\services\projectImportService.ts" >nul
copy /Y "src.pre-presign-direct\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
if exist "public.pre-presign-direct\help.html" copy /Y "public.pre-presign-direct\help.html" "public\help.html" >nul
if exist "public.pre-presign-direct\NCP-PROJECT-SETUP.md" copy /Y "public.pre-presign-direct\NCP-PROJECT-SETUP.md" "docs\NCP-PROJECT-SETUP.md" >nul
echo Restored presign-direct. Redeploy Vercel API and reload Metro.
endlocal
