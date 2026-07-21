@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-crop-viewport-fix\services\stampImageCrop.ts" (
  echo Backup not found: src.pre-crop-viewport-fix
  exit /b 1
)
copy /Y "src.pre-crop-viewport-fix\services\stampImageCrop.ts" "src\services\stampImageCrop.ts"
if exist "src.pre-crop-viewport-fix\help.html" (
  copy /Y "src.pre-crop-viewport-fix\help.html" "public\help.html"
)
if exist "src.pre-crop-viewport-fix\apkBuildLabel.ts" (
  copy /Y "src.pre-crop-viewport-fix\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "src.pre-crop-viewport-fix\landing.html" (
  copy /Y "src.pre-crop-viewport-fix\landing.html" "public\landing.html"
)
if exist "src.pre-crop-viewport-fix\info.html" (
  copy /Y "src.pre-crop-viewport-fix\info.html" "public\info.html"
)
echo Restored crop viewport math from src.pre-crop-viewport-fix
