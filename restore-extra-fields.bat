@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-extra-fields\db\schema.ts" (
  echo Backup not found: src.pre-extra-fields
  exit /b 1
)
copy /Y "src.pre-extra-fields\db\schema.ts" "src\db\schema.ts"
copy /Y "src.pre-extra-fields\db\database.ts" "src\db\database.ts"
copy /Y "src.pre-extra-fields\types\stamp.ts" "src\types\stamp.ts"
copy /Y "src.pre-extra-fields\services\stampRepository.ts" "src\services\stampRepository.ts"
copy /Y "src.pre-extra-fields\services\fieldLabels.ts" "src\services\fieldLabels.ts"
copy /Y "src.pre-extra-fields\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-extra-fields\services\stampSaveModalLayoutCache.ts" "src\services\stampSaveModalLayoutCache.ts"
copy /Y "src.pre-extra-fields\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-extra-fields\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-extra-fields\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-extra-fields\services\exportProject.ts" "src\services\exportProject.ts"
copy /Y "src.pre-extra-fields\services\captionLayout.ts" "src\services\captionLayout.ts"
copy /Y "src.pre-extra-fields\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-extra-fields\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-extra-fields\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-extra-fields\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-extra-fields\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-extra-fields\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
copy /Y "src.pre-extra-fields\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src.pre-extra-fields\public\help.html" copy /Y "src.pre-extra-fields\public\help.html" "public\help.html"
if exist "src.pre-extra-fields\public\landing.html" copy /Y "src.pre-extra-fields\public\landing.html" "public\landing.html"
if exist "src.pre-extra-fields\public\info.html" copy /Y "src.pre-extra-fields\public\info.html" "public\info.html"
if exist "src.pre-extra-fields\report\watermark-export.js" copy /Y "src.pre-extra-fields\report\watermark-export.js" "public\report\watermark-export.js"
if exist "src.pre-extra-fields\apkBuildLabel.ts" copy /Y "src.pre-extra-fields\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored extra fields from src.pre-extra-fields
