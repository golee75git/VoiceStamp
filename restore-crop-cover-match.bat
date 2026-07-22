@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-crop-cover-match\services\stampImageCrop.ts" (
  echo Backup not found: src.pre-crop-cover-match
  exit /b 1
)
copy /Y "src.pre-crop-cover-match\services\stampImageCrop.ts" "src\services\stampImageCrop.ts"
copy /Y "src.pre-crop-cover-match\components\ZoomableImage.tsx" "src\components\ZoomableImage.tsx"
if exist "src.pre-crop-cover-match\components\StampSaveZoomViewer.tsx" copy /Y "src.pre-crop-cover-match\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx"
if exist "src.pre-crop-cover-match\components\StampSaveModal.tsx" copy /Y "src.pre-crop-cover-match\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-crop-cover-match\public\help.html" copy /Y "src.pre-crop-cover-match\public\help.html" "public\help.html"
if exist "src.pre-crop-cover-match\apkBuildLabel.ts" copy /Y "src.pre-crop-cover-match\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored crop cover-match from src.pre-crop-cover-match
