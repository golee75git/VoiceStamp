@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-title-ux\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-title-ux
  exit /b 1
)
copy /Y "src.pre-title-ux\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored StampSaveModal from src.pre-title-ux (title UX rollback)
