@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-more-field-templates\services\stampFieldTemplates.ts" (
  echo Backup not found: src.pre-more-field-templates
  exit /b 1
)
copy /Y "src.pre-more-field-templates\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts"
if exist "src.pre-more-field-templates\public\help.html" copy /Y "src.pre-more-field-templates\public\help.html" "public\help.html"
if exist "src.pre-more-field-templates\public\landing.html" copy /Y "src.pre-more-field-templates\public\landing.html" "public\landing.html"
if exist "src.pre-more-field-templates\public\info.html" copy /Y "src.pre-more-field-templates\public\info.html" "public\info.html"
if exist "src.pre-more-field-templates\constants\apkBuildLabel.ts" copy /Y "src.pre-more-field-templates\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored more-field-templates from src.pre-more-field-templates
