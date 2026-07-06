@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-preview-zoom-badge\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-stamp-preview-zoom-badge
  exit /b 1
)
copy /Y "src.pre-stamp-preview-zoom-badge\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-stamp-preview-zoom-badge\assets\zoomedit.png" "assets\zoomedit.png"
echo Restored stamp-preview-zoom-badge rollback from src.pre-stamp-preview-zoom-badge
