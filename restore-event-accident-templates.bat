@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-event-accident-templates\services\stampFieldTemplates.ts" (
  echo Backup not found: src.pre-event-accident-templates
  exit /b 1
)
copy /Y "src.pre-event-accident-templates\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts"
if exist "public.pre-event-accident-templates\help.html" (
  copy /Y "public.pre-event-accident-templates\help.html" "public\help.html"
)
echo Restored event-accident-templates from src.pre-event-accident-templates / public.pre-event-accident-templates
endlocal
