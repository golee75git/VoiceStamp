@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-xlsx-template-fields\services\exportXlsx.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-xlsx-template-fields\services\exportXlsx.ts" "src\services\exportXlsx.ts" >nul
copy /Y "src.pre-xlsx-template-fields\services\projectUploadQueue.ts" "src\services\projectUploadQueue.ts" >nul
copy /Y "src.pre-xlsx-template-fields\services\projectImportService.ts" "src\services\projectImportService.ts" >nul
if exist "api.pre-xlsx-template-fields\project.js" copy /Y "api.pre-xlsx-template-fields\project.js" "api\project.js" >nul
if exist "public.pre-xlsx-template-fields\help.html" copy /Y "public.pre-xlsx-template-fields\help.html" "public\help.html" >nul
echo Restored xlsx template fields. Redeploy API if needed.
endlocal
