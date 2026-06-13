@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-crop\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-stamp-crop
  exit /b 1
)
copy /Y "src.pre-stamp-crop\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-stamp-crop\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx"
copy /Y "src.pre-stamp-crop\components\ZoomableImage.tsx" "src\components\ZoomableImage.tsx"
copy /Y "src.pre-stamp-crop\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-stamp-crop\services\fileService.ts" "src\services\fileService.ts"
if exist "src\services\stampImageCrop.ts" del /Q "src\services\stampImageCrop.ts"
echo Restored stamp crop save from src.pre-stamp-crop
