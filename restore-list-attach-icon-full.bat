@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-attach-icon-full\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-attach-icon-full
  exit /b 1
)
copy /Y "src.pre-list-attach-icon-full\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored list attach icon full rollback from src.pre-list-attach-icon-full
