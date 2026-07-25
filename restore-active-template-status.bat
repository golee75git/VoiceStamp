@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-active-template-status\services\stampFieldTemplates.ts" (
  echo Backup not found: src.pre-active-template-status
  exit /b 1
)
copy /Y "src.pre-active-template-status\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts" >nul
copy /Y "src.pre-active-template-status\components\FieldTemplateSheet.tsx" "src\components\FieldTemplateSheet.tsx" >nul
if exist "src.pre-active-template-status\public\help.html" copy /Y "src.pre-active-template-status\public\help.html" "public\help.html" >nul
if exist "src.pre-active-template-status\public\landing.html" copy /Y "src.pre-active-template-status\public\landing.html" "public\landing.html" >nul
if exist "src.pre-active-template-status\public\info.html" copy /Y "src.pre-active-template-status\public\info.html" "public\info.html" >nul
if exist "src.pre-active-template-status\constants\apkBuildLabel.ts" copy /Y "src.pre-active-template-status\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
echo Restored active-template-status from src.pre-active-template-status
