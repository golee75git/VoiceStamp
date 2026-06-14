@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-coords-label\components\SettingsScreen.tsx" (
  echo Backup not found: src.pre-coords-label
  exit /b 1
)
copy /Y "src.pre-coords-label\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-coords-label\services\stampCoords.ts" "src\services\stampCoords.ts"
copy /Y "src.pre-coords-label\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-coords-label\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-coords-label\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-coords-label\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-coords-label\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-coords-label\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-coords-label\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-coords-label\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-coords-label\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-coords-label\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
echo Restored coords label setting rollback (§95)
