@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-site-label\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-site-label
  exit /b 1
)
copy /Y "src.pre-site-label\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored site-label rollback from src.pre-site-label
