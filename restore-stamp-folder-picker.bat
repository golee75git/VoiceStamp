@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-folder-picker\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-stamp-folder-picker
  exit /b 1
)
copy /Y "src.pre-stamp-folder-picker\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-stamp-folder-picker\services\settingsService.ts" "src\services\settingsService.ts"
if exist "src\services\stampFolderService.ts" del /F "src\services\stampFolderService.ts"
echo Restored stamp-folder-picker rollback from src.pre-stamp-folder-picker
