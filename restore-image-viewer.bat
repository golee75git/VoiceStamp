@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-image-viewer\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-image-viewer
  exit /b 1
)
copy /Y "src.pre-image-viewer\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored image-viewer rollback from src.pre-image-viewer
