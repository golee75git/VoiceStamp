@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-caption-white\services\renderStampCaptionNative.ts" (
  echo Backup not found: src.pre-caption-white
  exit /b 1
)
copy /Y "src.pre-caption-white\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
echo Restored caption white background from src.pre-caption-white
