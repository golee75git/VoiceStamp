@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-site-modal\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-site-modal
  exit /b 1
)
copy /Y "src.pre-site-modal\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-site-modal\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
echo Restored site-modal rollback from src.pre-site-modal
