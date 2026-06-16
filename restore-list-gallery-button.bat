@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-gallery-button\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-gallery-button
  exit /b 1
)
copy /Y "src.pre-list-gallery-button\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored list gallery button rollback from src.pre-list-gallery-button
