@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-silent-loading\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-silent-loading
  exit /b 1
)
copy /Y "src.pre-list-silent-loading\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored list-silent-loading rollback from src.pre-list-silent-loading
