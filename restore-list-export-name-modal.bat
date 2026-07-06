@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-export-name-modal\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-export-name-modal
  exit /b 1
)
copy /Y "src.pre-list-export-name-modal\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src\components\ExportNameModal.tsx" del /Q "src\components\ExportNameModal.tsx"
echo Restored list export name inline UI from src.pre-list-export-name-modal
