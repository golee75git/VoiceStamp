@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-field-templates\services\fieldLabels.ts" (
  echo Backup not found: src.pre-field-templates
  exit /b 1
)
xcopy /E /Y /I "src.pre-field-templates\db\*" "src\db\" >nul
xcopy /E /Y /I "src.pre-field-templates\types\*" "src\types\" >nul
xcopy /E /Y /I "src.pre-field-templates\services\*" "src\services\" >nul
xcopy /E /Y /I "src.pre-field-templates\components\*" "src\components\" >nul
if exist "src.pre-field-templates\public\help.html" copy /Y "src.pre-field-templates\public\help.html" "public\help.html"
if exist "src.pre-field-templates\public\landing.html" copy /Y "src.pre-field-templates\public\landing.html" "public\landing.html"
if exist "src.pre-field-templates\public\info.html" copy /Y "src.pre-field-templates\public\info.html" "public\info.html"
if exist "src.pre-field-templates\constants\apkBuildLabel.ts" copy /Y "src.pre-field-templates\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
if exist "src\services\stampFieldTemplates.ts" del /F /Q "src\services\stampFieldTemplates.ts"
if exist "src\components\FieldTemplateSheet.tsx" del /F /Q "src\components\FieldTemplateSheet.tsx"
echo Restored field-templates from src.pre-field-templates
echo Note: assets\template-icon.png is kept; delete manually if unwanted.
