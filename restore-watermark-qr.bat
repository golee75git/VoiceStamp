@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-watermark-qr\services\renderStampWatermarkNative.ts" (
  echo Backup not found: src.pre-watermark-qr
  exit /b 1
)
copy /Y "src.pre-watermark-qr\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-watermark-qr\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-watermark-qr\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-watermark-qr\services\qrCodeService.ts" "src\services\qrCodeService.ts"
copy /Y "src.pre-watermark-qr\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-watermark-qr\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-watermark-qr\stamp.ts" "src\types\stamp.ts"
if exist "public.pre-watermark-qr\help.html" (
  copy /Y "public.pre-watermark-qr\help.html" "public\help.html"
)
echo Restored watermark-qr from src.pre-watermark-qr / public.pre-watermark-qr
endlocal
