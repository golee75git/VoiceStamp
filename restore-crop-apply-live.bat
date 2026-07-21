@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-crop-apply-live\components\ZoomableImage.tsx" (
  echo Backup not found: src.pre-crop-apply-live
  exit /b 1
)
copy /Y "src.pre-crop-apply-live\components\ZoomableImage.tsx" "src\components\ZoomableImage.tsx"
copy /Y "src.pre-crop-apply-live\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx"
copy /Y "src.pre-crop-apply-live\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-crop-apply-live\services\stampImageCrop.ts" "src\services\stampImageCrop.ts"
if exist "src.pre-crop-apply-live\help.html" (
  copy /Y "src.pre-crop-apply-live\help.html" "public\help.html"
)
if exist "src.pre-crop-apply-live\constants\apkBuildLabel.ts" (
  copy /Y "src.pre-crop-apply-live\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "src.pre-crop-apply-live\landing.html" (
  copy /Y "src.pre-crop-apply-live\landing.html" "public\landing.html"
)
if exist "src.pre-crop-apply-live\info.html" (
  copy /Y "src.pre-crop-apply-live\info.html" "public\info.html"
)
echo Restored crop apply-live fix from src.pre-crop-apply-live
