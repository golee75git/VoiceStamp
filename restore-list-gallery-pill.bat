@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-gallery-pill\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-gallery-pill
  exit /b 1
)
copy /Y "src.pre-list-gallery-pill\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored list gallery pill button rollback from src.pre-list-gallery-pill
