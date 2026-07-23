@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-template-label-flash\services\stampFieldTemplates.ts" (
  echo Backup not found: src.pre-template-label-flash
  exit /b 1
)
copy /Y "src.pre-template-label-flash\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts"
copy /Y "src.pre-template-label-flash\services\stampSaveModalLayoutCache.ts" "src\services\stampSaveModalLayoutCache.ts"
copy /Y "src.pre-template-label-flash\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-template-label-flash\public\help.html" copy /Y "src.pre-template-label-flash\public\help.html" "public\help.html"
if exist "src.pre-template-label-flash\public\landing.html" copy /Y "src.pre-template-label-flash\public\landing.html" "public\landing.html"
if exist "src.pre-template-label-flash\public\info.html" copy /Y "src.pre-template-label-flash\public\info.html" "public\info.html"
if exist "src.pre-template-label-flash\constants\apkBuildLabel.ts" copy /Y "src.pre-template-label-flash\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored template-label-flash from src.pre-template-label-flash
