@echo off
setlocal
cd /d "%~dp0"

echo Restoring watermark palette files from backup...

if not exist "src.pre-watermark-palette\watermarkStyle.ts" (
  echo ERROR: src.pre-watermark-palette backup not found.
  exit /b 1
)

copy /Y "src.pre-watermark-palette\watermarkStyle.ts" "src\services\watermarkStyle.ts" >nul
copy /Y "src.pre-watermark-palette\settingsService.ts" "src\services\settingsService.ts" >nul
copy /Y "src.pre-watermark-palette\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul

if exist "public.pre-watermark-palette\watermark-export.js" (
  copy /Y "public.pre-watermark-palette\watermark-export.js" "public\report\watermark-export.js" >nul
)

echo Done. Rebuild APK and redeploy if needed.
endlocal
