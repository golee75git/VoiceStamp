@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-field-labels\settingsService.ts" (
  echo Backup not found: src.pre-field-labels
  exit /b 1
)
copy /Y "src.pre-field-labels\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-field-labels\overlayText.ts" "src\services\overlayText.ts"
copy /Y "src.pre-field-labels\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-field-labels\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-field-labels\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-field-labels\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-field-labels\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-field-labels\stampSaveModalLayoutCache.ts" "src\services\stampSaveModalLayoutCache.ts"
if exist "src.pre-field-labels\exportProject.ts" copy /Y "src.pre-field-labels\exportProject.ts" "src\services\exportProject.ts"
copy /Y "src.pre-field-labels\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-field-labels\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-field-labels\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-field-labels\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
copy /Y "src.pre-field-labels\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src.pre-field-labels\public\help.html" copy /Y "src.pre-field-labels\public\help.html" "public\help.html"
if exist "src.pre-field-labels\public\landing.html" copy /Y "src.pre-field-labels\public\landing.html" "public\landing.html"
if exist "src.pre-field-labels\public\info.html" copy /Y "src.pre-field-labels\public\info.html" "public\info.html"
if exist "src.pre-field-labels\apkBuildLabel.ts" copy /Y "src.pre-field-labels\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
if exist "src.pre-field-labels\report\watermark-export.js" copy /Y "src.pre-field-labels\report\watermark-export.js" "public\report\watermark-export.js"
if exist "src\services\fieldLabels.ts" del /F /Q "src\services\fieldLabels.ts"
echo Restored field labels feature from src.pre-field-labels
