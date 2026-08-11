@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "src.pre-photo-sheet-template\services\stampFieldTemplates.ts" (
  echo [ERROR] Missing src.pre-photo-sheet-template\services\stampFieldTemplates.ts
  exit /b 1
)

copy /Y "src.pre-photo-sheet-template\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts" >nul
if exist "public.pre-photo-sheet-template\help.html" (
  copy /Y "public.pre-photo-sheet-template\help.html" "public\help.html" >nul
)

echo Restored stampFieldTemplates.ts and help.html from *.pre-photo-sheet-template
exit /b 0
