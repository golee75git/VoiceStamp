@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-caption-green-border\services\renderStampCaptionNative.ts" (
  echo Backup not found: src.pre-caption-green-border
  exit /b 1
)
copy /Y "src.pre-caption-green-border\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
if exist "src.pre-caption-green-border\public\help.html" copy /Y "src.pre-caption-green-border\public\help.html" "public\help.html"
if exist "src.pre-caption-green-border\public\landing.html" copy /Y "src.pre-caption-green-border\public\landing.html" "public\landing.html"
if exist "src.pre-caption-green-border\public\info.html" copy /Y "src.pre-caption-green-border\public\info.html" "public\info.html"
if exist "src.pre-caption-green-border\constants\apkBuildLabel.ts" copy /Y "src.pre-caption-green-border\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored caption-green-border from src.pre-caption-green-border
