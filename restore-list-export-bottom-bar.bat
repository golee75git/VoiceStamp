@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-export-bottom-bar\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-export-bottom-bar
  exit /b 1
)
copy /Y "src.pre-list-export-bottom-bar\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored list export bottom bar rollback from src.pre-list-export-bottom-bar
