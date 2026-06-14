@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-watermark-preview-v2\components\StampSavePreview.tsx" (
  echo Backup not found: src.pre-watermark-preview-v2
  exit /b 1
)
copy /Y "src.pre-watermark-preview-v2\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-watermark-preview-v2\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
echo Restored watermark preview v2 rollback (§102)
