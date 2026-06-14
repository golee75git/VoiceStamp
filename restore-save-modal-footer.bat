@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-modal-footer\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-modal-footer
  exit /b 1
)
copy /Y "src.pre-save-modal-footer\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored save modal footer layout rollback (§97)
