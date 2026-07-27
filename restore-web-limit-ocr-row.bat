@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-web-limit-ocr-row\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-web-limit-ocr-row
  exit /b 1
)
copy /Y "src.pre-web-limit-ocr-row\App.tsx" "App.tsx" >nul
copy /Y "src.pre-web-limit-ocr-row\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "src\components\WebLimitNoticeScreen.tsx" del /F /Q "src\components\WebLimitNoticeScreen.tsx"
if exist "src.pre-web-limit-ocr-row\public\help.html" copy /Y "src.pre-web-limit-ocr-row\public\help.html" "public\help.html" >nul
if exist "src.pre-web-limit-ocr-row\apkBuildLabel.ts" copy /Y "src.pre-web-limit-ocr-row\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
echo Restored web-limit-ocr-row from src.pre-web-limit-ocr-row
