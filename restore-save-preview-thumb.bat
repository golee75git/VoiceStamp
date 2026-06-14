@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-preview-thumb\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-preview-thumb
  exit /b 1
)
copy /Y "src.pre-save-preview-thumb\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-save-preview-thumb\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-save-preview-thumb\services\exportStampImage.ts" "src\services\exportStampImage.ts"
echo Restored save preview thumb rollback (§99)
