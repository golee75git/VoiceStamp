@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-gear-footer\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-gear-footer
  exit /b 1
)
copy /Y "src.pre-list-gear-footer\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored list gear footer rollback from src.pre-list-gear-footer
