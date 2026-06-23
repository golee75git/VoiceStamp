@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-web-trash-confirm\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-web-trash-confirm
  exit /b 1
)
copy /Y "src.pre-web-trash-confirm\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-web-trash-confirm\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src\utils\confirmAlert.ts" del /F "src\utils\confirmAlert.ts"
echo Restored web trash confirm rollback from src.pre-web-trash-confirm
