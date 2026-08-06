@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-work-content-template\services\stampFieldTemplates.ts" (
  echo Backup not found: src.pre-work-content-template
  exit /b 1
)
copy /Y "src.pre-work-content-template\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts"
if exist "public.pre-work-content-template\help.html" (
  copy /Y "public.pre-work-content-template\help.html" "public\help.html"
)
echo Restored work-content-template from src.pre-work-content-template / public.pre-work-content-template
endlocal
