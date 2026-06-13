@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-zoom-viewer\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-zoom-viewer
  exit /b 1
)
copy /Y "src.pre-save-zoom-viewer\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-save-zoom-viewer\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-save-zoom-viewer\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-save-zoom-viewer\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-save-zoom-viewer\App.tsx" "App.tsx"
copy /Y "src.pre-save-zoom-viewer\package.json" "package.json"
copy /Y "src.pre-save-zoom-viewer\package-lock.json" "package-lock.json"
if exist "src\components\StampSaveZoomViewer.tsx" del /Q "src\components\StampSaveZoomViewer.tsx"
if exist "src\components\ZoomableImage.tsx" del /Q "src\components\ZoomableImage.tsx"
if exist "babel.config.js" del /Q "babel.config.js"
copy /Y "src.pre-save-zoom-viewer\index.ts" "index.ts"
call npm install
echo Restored save zoom viewer from src.pre-save-zoom-viewer
