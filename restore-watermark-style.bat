@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-watermark-style\services\settingsService.ts" (
  echo Backup not found: src.pre-watermark-style
  exit /b 1
)
copy /Y "src.pre-watermark-style\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-watermark-style\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-watermark-style\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-watermark-style\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-watermark-style\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-watermark-style\services\exportProject.ts" "src\services\exportProject.ts"
copy /Y "src.pre-watermark-style\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-watermark-style\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-watermark-style\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
copy /Y "src.pre-watermark-style\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-watermark-style\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
del "src\services\watermarkStyle.ts" 2>nul
del "src\components\WatermarkBarBackground.tsx" 2>nul
echo Restored watermark-style rollback (§106)
