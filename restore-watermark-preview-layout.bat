@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-watermark-preview-layout\components\StampSavePreview.tsx" (
  echo Backup not found: src.pre-watermark-preview-layout
  exit /b 1
)
copy /Y "src.pre-watermark-preview-layout\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
echo Restored watermark preview layout rollback (§101)
