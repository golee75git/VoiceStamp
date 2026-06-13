@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-zoom-modal-fix\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-zoom-modal-fix
  exit /b 1
)
copy /Y "src.pre-save-zoom-modal-fix\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-save-zoom-modal-fix\components\ZoomableImage.tsx" "src\components\ZoomableImage.tsx"
echo Restored save zoom modal gesture fix from src.pre-save-zoom-modal-fix
