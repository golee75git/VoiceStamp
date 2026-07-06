@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-zoom-png\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-stamp-zoom-png
  exit /b 1
)
copy /Y "src.pre-stamp-zoom-png\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored stamp zoom.png to zoomedit.png reference from src.pre-stamp-zoom-png
