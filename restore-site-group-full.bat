@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-site-group-full\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-site-group-full
  exit /b 1
)
copy /Y "src.pre-site-group-full\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-site-group-full\services\fileService.ts" "src\services\fileService.ts"
copy /Y "src.pre-site-group-full\services\saveStamp.ts" "src\services\saveStamp.ts"
echo Restored site-group-full rollback from src.pre-site-group-full
