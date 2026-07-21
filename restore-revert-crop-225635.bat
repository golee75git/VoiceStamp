@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-revert-crop-225635\components\ZoomableImage.tsx" (
  echo Backup not found: src.pre-revert-crop-225635
  exit /b 1
)
copy /Y "src.pre-revert-crop-225635\components\ZoomableImage.tsx" "src\components\ZoomableImage.tsx"
copy /Y "src.pre-revert-crop-225635\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx"
copy /Y "src.pre-revert-crop-225635\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-revert-crop-225635\services\stampImageCrop.ts" "src\services\stampImageCrop.ts"
if exist "src.pre-revert-crop-225635\help.html" (
  copy /Y "src.pre-revert-crop-225635\help.html" "public\help.html"
)
if exist "src.pre-revert-crop-225635\constants\apkBuildLabel.ts" (
  copy /Y "src.pre-revert-crop-225635\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "src.pre-revert-crop-225635\landing.html" (
  copy /Y "src.pre-revert-crop-225635\landing.html" "public\landing.html"
)
if exist "src.pre-revert-crop-225635\info.html" (
  copy /Y "src.pre-revert-crop-225635\info.html" "public\info.html"
)
echo Restored pre-225635-revert (crop UI-flush era) from src.pre-revert-crop-225635
