@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-viewer-actions\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-viewer-actions
  exit /b 1
)
copy /Y "src.pre-save-viewer-actions\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-save-viewer-actions\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx"
echo Restored save viewer actions from src.pre-save-viewer-actions
