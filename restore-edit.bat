@echo off
cd /d "%~dp0"
if not exist "src.pre-edit" (
  echo ERROR: src.pre-edit backup not found.
  exit /b 1
)
copy /Y "src.pre-edit\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
copy /Y "src.pre-edit\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
copy /Y "src.pre-edit\services\saveStamp.ts" "src\services\saveStamp.ts" >nul
copy /Y "src.pre-edit\services\stampRepository.ts" "src\services\stampRepository.ts" >nul
echo Restored edit-related files from src.pre-edit
