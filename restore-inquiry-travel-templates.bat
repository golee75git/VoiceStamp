@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-inquiry-travel-templates\services\stampFieldTemplates.ts" (
  echo Backup not found: src.pre-inquiry-travel-templates
  exit /b 1
)
copy /Y "src.pre-inquiry-travel-templates\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts"
if exist "public.pre-inquiry-travel-templates\help.html" (
  copy /Y "public.pre-inquiry-travel-templates\help.html" "public\help.html"
)
echo Restored inquiry-travel-templates from src.pre-inquiry-travel-templates / public.pre-inquiry-travel-templates
endlocal
