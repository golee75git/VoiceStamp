@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-caption-export-wash\services\exportStampImage.ts" (
  echo Backup not found: src.pre-caption-export-wash
  exit /b 1
)
copy /Y "src.pre-caption-export-wash\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-caption-export-wash\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
if exist "src.pre-caption-export-wash\public\help.html" copy /Y "src.pre-caption-export-wash\public\help.html" "public\help.html"
if exist "src.pre-caption-export-wash\public\landing.html" copy /Y "src.pre-caption-export-wash\public\landing.html" "public\landing.html"
if exist "src.pre-caption-export-wash\public\info.html" copy /Y "src.pre-caption-export-wash\public\info.html" "public\info.html"
if exist "src.pre-caption-export-wash\constants\apkBuildLabel.ts" copy /Y "src.pre-caption-export-wash\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored caption-export-wash from src.pre-caption-export-wash
