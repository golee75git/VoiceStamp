@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-trash-empty-back\components\TrashScreen.tsx" (
  echo Backup not found: src.pre-trash-empty-back
  exit /b 1
)
copy /Y "src.pre-trash-empty-back\components\TrashScreen.tsx" "src\components\TrashScreen.tsx"
echo Restored trash empty-back rollback from src.pre-trash-empty-back
