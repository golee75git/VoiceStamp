@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-template-sheet-scroll\components\FieldTemplateSheet.tsx" (
  echo Backup not found: src.pre-template-sheet-scroll
  exit /b 1
)
copy /Y "src.pre-template-sheet-scroll\components\FieldTemplateSheet.tsx" "src\components\FieldTemplateSheet.tsx"
if exist "src.pre-template-sheet-scroll\public\help.html" copy /Y "src.pre-template-sheet-scroll\public\help.html" "public\help.html"
if exist "src.pre-template-sheet-scroll\public\landing.html" copy /Y "src.pre-template-sheet-scroll\public\landing.html" "public\landing.html"
if exist "src.pre-template-sheet-scroll\public\info.html" copy /Y "src.pre-template-sheet-scroll\public\info.html" "public\info.html"
if exist "src.pre-template-sheet-scroll\constants\apkBuildLabel.ts" copy /Y "src.pre-template-sheet-scroll\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored template-sheet-scroll from src.pre-template-sheet-scroll
