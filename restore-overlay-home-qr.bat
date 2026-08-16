@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-overlay-home-qr\services\exportPdf.ts" (
  echo Backup not found: src.pre-overlay-home-qr
  exit /b 1
)
copy /Y "src.pre-overlay-home-qr\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-overlay-home-qr\services\overlayText.ts" "src\services\overlayText.ts"
copy /Y "src.pre-overlay-home-qr\services\qrCodeService.ts" "src\services\qrCodeService.ts"
copy /Y "src.pre-overlay-home-qr\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-overlay-home-qr\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-overlay-home-qr\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-overlay-home-qr\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-overlay-home-qr\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src\services\overlayHomeQr.ts" (
  del /F /Q "src\services\overlayHomeQr.ts"
)
if exist "public.pre-overlay-home-qr\help.html" (
  copy /Y "public.pre-overlay-home-qr\help.html" "public\help.html"
)
echo Restored overlay-home-qr from src.pre-overlay-home-qr / public.pre-overlay-home-qr
endlocal
