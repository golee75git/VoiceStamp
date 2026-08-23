@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-save-viewer-caption\components\StampSaveModal.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-save-viewer-caption\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
copy /Y "src.pre-save-viewer-caption\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx" >nul
copy /Y "src.pre-save-viewer-caption\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx" >nul
if exist "public.pre-save-viewer-caption\help.html" copy /Y "public.pre-save-viewer-caption\help.html" "public\help.html" >nul
echo Restored save-viewer caption. Reload Metro.
endlocal
