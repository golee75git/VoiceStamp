@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-edit-crop\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-edit-crop
  exit /b 1
)
copy /Y "src.pre-edit-crop\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-edit-crop\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-edit-crop\services\fileService.ts" "src\services\fileService.ts"
echo Restored edit crop from src.pre-edit-crop
