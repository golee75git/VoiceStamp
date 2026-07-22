@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-text-size\services\settingsService.ts" (
  echo Backup not found: src.pre-stamp-text-size
  exit /b 1
)
copy /Y "src.pre-stamp-text-size\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-stamp-text-size\services\captionLayout.ts" "src\services\captionLayout.ts"
copy /Y "src.pre-stamp-text-size\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-stamp-text-size\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-stamp-text-size\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-stamp-text-size\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-stamp-text-size\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-stamp-text-size\services\stampSaveModalLayoutCache.ts" "src\services\stampSaveModalLayoutCache.ts"
copy /Y "src.pre-stamp-text-size\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx"
copy /Y "src.pre-stamp-text-size\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-stamp-text-size\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-stamp-text-size\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-stamp-text-size\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-stamp-text-size\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
if exist "src.pre-stamp-text-size\public\help.html" copy /Y "src.pre-stamp-text-size\public\help.html" "public\help.html"
if exist "src.pre-stamp-text-size\apkBuildLabel.ts" copy /Y "src.pre-stamp-text-size\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored stamp text size from src.pre-stamp-text-size
