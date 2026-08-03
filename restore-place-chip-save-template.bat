@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-place-chip-save-template\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-place-chip-save-template
  exit /b 1
)
copy /Y "src.pre-place-chip-save-template\services\saveStamp.ts" "src\services\saveStamp.ts" >nul
copy /Y "src.pre-place-chip-save-template\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
copy /Y "src.pre-place-chip-save-template\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
copy /Y "src.pre-place-chip-save-template\utils\stampListSearch.ts" "src\utils\stampListSearch.ts" >nul
if exist "public.pre-place-chip-save-template\help.html" copy /Y "public.pre-place-chip-save-template\help.html" "public\help.html" >nul
echo Restored place-chip-save-template from src.pre-place-chip-save-template
