@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-coords\services\locationService.ts" (
  echo Backup not found: src.pre-stamp-coords
  exit /b 1
)
copy /Y "src.pre-stamp-coords\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
copy /Y "src.pre-stamp-coords\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-stamp-coords\db\database.ts" "src\db\database.ts"
copy /Y "src.pre-stamp-coords\db\schema.ts" "src\db\schema.ts"
copy /Y "src.pre-stamp-coords\services\captionLayout.ts" "src\services\captionLayout.ts"
copy /Y "src.pre-stamp-coords\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-stamp-coords\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-stamp-coords\services\locationService.ts" "src\services\locationService.ts"
copy /Y "src.pre-stamp-coords\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-stamp-coords\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-stamp-coords\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-stamp-coords\services\stampRepository.ts" "src\services\stampRepository.ts"
copy /Y "src.pre-stamp-coords\types\stamp.ts" "src\types\stamp.ts"
if exist "src\services\stampCoords.ts" del /Q "src\services\stampCoords.ts"
echo Restored stamp coords feature from src.pre-stamp-coords
