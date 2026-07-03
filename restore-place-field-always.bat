@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-place-field-always\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-place-field-always
  exit /b 1
)
copy /Y "src.pre-place-field-always\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored place-field-always rollback from src.pre-place-field-always
