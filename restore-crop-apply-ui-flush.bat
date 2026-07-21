@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-crop-apply-ui-flush\components\ZoomableImage.tsx" (
  echo Backup not found: src.pre-crop-apply-ui-flush
  exit /b 1
)
copy /Y "src.pre-crop-apply-ui-flush\components\ZoomableImage.tsx" "src\components\ZoomableImage.tsx"
copy /Y "src.pre-crop-apply-ui-flush\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx"
copy /Y "src.pre-crop-apply-ui-flush\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-crop-apply-ui-flush\services\stampImageCrop.ts" "src\services\stampImageCrop.ts"
if exist "src.pre-crop-apply-ui-flush\help.html" (
  copy /Y "src.pre-crop-apply-ui-flush\help.html" "public\help.html"
)
if exist "src.pre-crop-apply-ui-flush\constants\apkBuildLabel.ts" (
  copy /Y "src.pre-crop-apply-ui-flush\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "src.pre-crop-apply-ui-flush\landing.html" (
  copy /Y "src.pre-crop-apply-ui-flush\landing.html" "public\landing.html"
)
if exist "src.pre-crop-apply-ui-flush\info.html" (
  copy /Y "src.pre-crop-apply-ui-flush\info.html" "public\info.html"
)
echo Restored crop apply UI-flush fix from src.pre-crop-apply-ui-flush
