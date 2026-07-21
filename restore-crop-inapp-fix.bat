@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-crop-inapp-fix\components\ZoomableImage.tsx" (
  echo Backup not found: src.pre-crop-inapp-fix
  exit /b 1
)
copy /Y "src.pre-crop-inapp-fix\components\ZoomableImage.tsx" "src\components\ZoomableImage.tsx"
copy /Y "src.pre-crop-inapp-fix\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx"
copy /Y "src.pre-crop-inapp-fix\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-crop-inapp-fix\services\stampImageCrop.ts" "src\services\stampImageCrop.ts"
if exist "src.pre-crop-inapp-fix\help.html" (
  copy /Y "src.pre-crop-inapp-fix\help.html" "public\help.html"
)
if exist "src.pre-crop-inapp-fix\constants\apkBuildLabel.ts" (
  copy /Y "src.pre-crop-inapp-fix\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "src.pre-crop-inapp-fix\landing.html" (
  copy /Y "src.pre-crop-inapp-fix\landing.html" "public\landing.html"
)
if exist "src.pre-crop-inapp-fix\info.html" (
  copy /Y "src.pre-crop-inapp-fix\info.html" "public\info.html"
)
echo Restored crop in-app fix from src.pre-crop-inapp-fix
