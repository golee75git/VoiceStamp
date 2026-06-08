@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-folder-edit\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-stamp-folder-edit
  exit /b 1
)
copy /Y "src.pre-stamp-folder-edit\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-stamp-folder-edit\services\fileService.ts" "src\services\fileService.ts"
copy /Y "src.pre-stamp-folder-edit\services\galleryService.ts" "src\services\galleryService.ts"
copy /Y "src.pre-stamp-folder-edit\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-stamp-folder-edit\services\stampRepository.ts" "src\services\stampRepository.ts"
copy /Y "src.pre-stamp-folder-edit\db\schema.ts" "src\db\schema.ts"
copy /Y "src.pre-stamp-folder-edit\db\database.ts" "src\db\database.ts"
copy /Y "src.pre-stamp-folder-edit\types\stamp.ts" "src\types\stamp.ts"
echo Restored stamp-folder-edit rollback from src.pre-stamp-folder-edit
