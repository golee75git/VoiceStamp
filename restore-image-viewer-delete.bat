@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-image-viewer-delete\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-image-viewer-delete
  exit /b 1
)
copy /Y "src.pre-image-viewer-delete\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored image-viewer-delete rollback from src.pre-image-viewer-delete
