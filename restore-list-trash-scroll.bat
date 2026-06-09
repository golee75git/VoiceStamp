@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-trash-scroll\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-trash-scroll
  exit /b 1
)
copy /Y "src.pre-list-trash-scroll\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored list-trash-scroll rollback from src.pre-list-trash-scroll
