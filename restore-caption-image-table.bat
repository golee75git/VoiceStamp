@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-caption-image-table\services\renderStampCaptionNative.ts" (
  echo Backup not found: src.pre-caption-image-table
  exit /b 1
)
copy /Y "src.pre-caption-image-table\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-caption-image-table\services\exportStampImage.ts" "src\services\exportStampImage.ts"
if exist "src.pre-caption-image-table\public\help.html" copy /Y "src.pre-caption-image-table\public\help.html" "public\help.html"
if exist "src.pre-caption-image-table\public\landing.html" copy /Y "src.pre-caption-image-table\public\landing.html" "public\landing.html"
if exist "src.pre-caption-image-table\public\info.html" copy /Y "src.pre-caption-image-table\public\info.html" "public\info.html"
if exist "src.pre-caption-image-table\constants\apkBuildLabel.ts" copy /Y "src.pre-caption-image-table\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored caption-image-table from src.pre-caption-image-table
