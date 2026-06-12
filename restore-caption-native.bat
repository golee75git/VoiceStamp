@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-caption-native\services\exportStampImage.ts" (
  echo Backup not found: src.pre-caption-native
  exit /b 1
)
copy /Y "src.pre-caption-native\services\exportStampImage.ts" "src\services\exportStampImage.ts"
if exist "src\services\renderStampCaptionNative.ts" del /Q "src\services\renderStampCaptionNative.ts"
if exist "src\services\captionLayout.ts" del /Q "src\services\captionLayout.ts"
echo Restored caption export from src.pre-caption-native
