@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-edit-trash-scroll\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-edit-trash-scroll
  exit /b 1
)
copy /Y "src.pre-edit-trash-scroll\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-edit-trash-scroll\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored edit-trash-scroll rollback from src.pre-edit-trash-scroll
