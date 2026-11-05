@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-empty-caption-lines\services\pdfTitleFormat.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-empty-caption-lines\services\pdfTitleFormat.ts" "src\services\pdfTitleFormat.ts" >nul
copy /Y "src.pre-empty-caption-lines\services\captionTable.ts" "src\services\captionTable.ts" >nul
copy /Y "src.pre-empty-caption-lines\services\stampPlace.ts" "src\services\stampPlace.ts" >nul
copy /Y "src.pre-empty-caption-lines\services\exportStampImage.ts" "src\services\exportStampImage.ts" >nul
copy /Y "src.pre-empty-caption-lines\services\exportPdf.ts" "src\services\exportPdf.ts" >nul
copy /Y "src.pre-empty-caption-lines\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts" >nul
copy /Y "src.pre-empty-caption-lines\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx" >nul
copy /Y "src.pre-empty-caption-lines\components\StampExportCard.tsx" "src\components\StampExportCard.tsx" >nul
copy /Y "src.pre-empty-caption-lines\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
if exist "public.pre-empty-caption-lines\help.html" copy /Y "public.pre-empty-caption-lines\help.html" "public\help.html" >nul
echo Restored empty caption lines. Reload Metro.
endlocal
