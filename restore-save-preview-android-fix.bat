@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-preview-android-fix\components\StampSavePreview.tsx" (
  echo Backup not found: src.pre-save-preview-android-fix
  exit /b 1
)
copy /Y "src.pre-save-preview-android-fix\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-save-preview-android-fix\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-save-preview-android-fix\services\exportStampImage.ts" "src\services\exportStampImage.ts"
echo Restored save preview Android fix rollback (§100)
