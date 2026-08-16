@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-promo-log-template\services\stampFieldTemplates.ts" (
  echo Backup not found: src.pre-promo-log-template
  exit /b 1
)
copy /Y "src.pre-promo-log-template\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts"
if exist "public.pre-promo-log-template\help.html" (
  copy /Y "public.pre-promo-log-template\help.html" "public\help.html"
)
echo Restored promo-log-template from src.pre-promo-log-template / public.pre-promo-log-template
endlocal
