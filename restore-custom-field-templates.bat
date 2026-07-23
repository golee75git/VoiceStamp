@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-custom-field-templates\services\stampFieldTemplates.ts" (
  echo Backup not found: src.pre-custom-field-templates
  exit /b 1
)
copy /Y "src.pre-custom-field-templates\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts"
copy /Y "src.pre-custom-field-templates\components\FieldTemplateSheet.tsx" "src\components\FieldTemplateSheet.tsx"
if exist "src\components\CustomFieldTemplateEditor.tsx" del /F /Q "src\components\CustomFieldTemplateEditor.tsx"
if exist "src.pre-custom-field-templates\public\help.html" copy /Y "src.pre-custom-field-templates\public\help.html" "public\help.html"
if exist "src.pre-custom-field-templates\public\landing.html" copy /Y "src.pre-custom-field-templates\public\landing.html" "public\landing.html"
if exist "src.pre-custom-field-templates\public\info.html" copy /Y "src.pre-custom-field-templates\public\info.html" "public\info.html"
if exist "src.pre-custom-field-templates\constants\apkBuildLabel.ts" copy /Y "src.pre-custom-field-templates\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored custom-field-templates from src.pre-custom-field-templates
