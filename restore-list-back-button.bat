@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-back-button\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-back-button
  exit /b 1
)
copy /Y "src.pre-list-back-button\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored list back button rollback from src.pre-list-back-button
