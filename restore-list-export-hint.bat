@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-export-hint\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-export-hint
  exit /b 1
)
copy /Y "src.pre-list-export-hint\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored list export hint from src.pre-list-export-hint
