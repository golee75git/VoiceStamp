@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-watermark-preview-caption-slot\components\StampSavePreview.tsx" (
  echo Backup not found: src.pre-watermark-preview-caption-slot
  exit /b 1
)
copy /Y "src.pre-watermark-preview-caption-slot\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
echo Restored watermark caption-slot preview rollback (§103)
