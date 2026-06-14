@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-modal-nav-padding\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-modal-nav-padding
  exit /b 1
)
copy /Y "src.pre-save-modal-nav-padding\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored save modal nav padding rollback (§98)
