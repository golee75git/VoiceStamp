@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-watermark-solid-light\services\settingsService.ts" (
  echo Backup not found: src.pre-watermark-solid-light
  exit /b 1
)
copy /Y "src.pre-watermark-solid-light\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-watermark-solid-light\services\watermarkStyle.ts" "src\services\watermarkStyle.ts"
copy /Y "src.pre-watermark-solid-light\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-watermark-solid-light\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-watermark-solid-light\components\WatermarkBarBackground.tsx" "src\components\WatermarkBarBackground.tsx"
echo Restored watermark-solid-light rollback (§107)
