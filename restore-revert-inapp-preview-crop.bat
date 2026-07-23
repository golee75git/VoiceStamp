@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-revert-inapp-preview-crop\services\stampImageCrop.ts" (
  echo Backup not found: src.pre-revert-inapp-preview-crop
  exit /b 1
)
copy /Y "src.pre-revert-inapp-preview-crop\services\stampImageCrop.ts" "src\services\stampImageCrop.ts"
copy /Y "src.pre-revert-inapp-preview-crop\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-revert-inapp-preview-crop\components\InAppCameraPreview.tsx" "src\components\InAppCameraPreview.tsx"
if exist "src.pre-revert-inapp-preview-crop\public\help.html" copy /Y "src.pre-revert-inapp-preview-crop\public\help.html" "public\help.html"
if exist "src.pre-revert-inapp-preview-crop\public\landing.html" copy /Y "src.pre-revert-inapp-preview-crop\public\landing.html" "public\landing.html"
if exist "src.pre-revert-inapp-preview-crop\public\info.html" copy /Y "src.pre-revert-inapp-preview-crop\public\info.html" "public\info.html"
if exist "src.pre-revert-inapp-preview-crop\constants\apkBuildLabel.ts" copy /Y "src.pre-revert-inapp-preview-crop\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored revert-inapp-preview-crop (re-applies FILL crop) from src.pre-revert-inapp-preview-crop
