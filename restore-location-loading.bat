@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-location-loading\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-location-loading
  exit /b 1
)
copy /Y "src.pre-location-loading\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored StampSaveModal from src.pre-location-loading (location loading UI rollback)
