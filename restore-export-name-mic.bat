@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-export-name-mic\components\ExportNameModal.tsx" (
  echo Backup not found: src.pre-export-name-mic
  exit /b 1
)
copy /Y "src.pre-export-name-mic\components\ExportNameModal.tsx" "src\components\ExportNameModal.tsx"
copy /Y "src.pre-export-name-mic\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src.pre-export-name-mic\help.html" copy /Y "src.pre-export-name-mic\help.html" "public\help.html"
echo Restored export name modal mic
