@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-overlay-mark\services\renderStampCaptionNative.ts" (
  echo Backup not found: src.pre-overlay-mark
  exit /b 1
)
copy /Y "src.pre-overlay-mark\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-overlay-mark\services\overlayText.ts" "src\services\overlayText.ts"
copy /Y "src.pre-overlay-mark\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-overlay-mark\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts"
copy /Y "src.pre-overlay-mark\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src\services\overlayMark.ts" (
  del /F /Q "src\services\overlayMark.ts"
)
if exist "public.pre-overlay-mark\help.html" (
  copy /Y "public.pre-overlay-mark\help.html" "public\help.html"
)
echo Restored overlay-mark from src.pre-overlay-mark / public.pre-overlay-mark
endlocal
