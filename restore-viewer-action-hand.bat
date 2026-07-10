@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-viewer-action-hand\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-viewer-action-hand
  exit /b 1
)
copy /Y "src.pre-viewer-action-hand\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-viewer-action-hand\components\StampSaveZoomViewer.tsx" (
  copy /Y "src.pre-viewer-action-hand\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx"
)
copy /Y "src.pre-viewer-action-hand\help.html" "public\help.html"
if exist "src.pre-viewer-action-hand\apkBuildLabel.ts" (
  copy /Y "src.pre-viewer-action-hand\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "src.pre-viewer-action-hand\landing.html" (
  copy /Y "src.pre-viewer-action-hand\landing.html" "public\landing.html"
)
if exist "src.pre-viewer-action-hand\info.html" (
  copy /Y "src.pre-viewer-action-hand\info.html" "public\info.html"
)
echo Restored viewer-action-hand rollback from src.pre-viewer-action-hand
