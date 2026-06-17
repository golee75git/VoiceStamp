@echo off
setlocal
cd /d "%~dp0"

echo Restoring overlay watermark layout (separate top org bar) from backup...

if not exist "src.pre-overlay-watermark-layout\exportStampImage.ts" (
  echo ERROR: src.pre-overlay-watermark-layout backup not found.
  exit /b 1
)

copy /Y "src.pre-overlay-watermark-layout\exportStampImage.ts" "src\services\exportStampImage.ts" >nul
copy /Y "src.pre-overlay-watermark-layout\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts" >nul
copy /Y "src.pre-overlay-watermark-layout\exportPdf.ts" "src\services\exportPdf.ts" >nul
copy /Y "src.pre-overlay-watermark-layout\StampSavePreview.tsx" "src\components\StampSavePreview.tsx" >nul

if exist "public.pre-overlay-watermark-layout\watermark-export.js" (
  copy /Y "public.pre-overlay-watermark-layout\watermark-export.js" "public\report\watermark-export.js" >nul
)

echo Done. Rebuild APK and redeploy if needed.
endlocal
