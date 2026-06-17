@echo off
setlocal
cd /d "%~dp0"

echo Restoring vivid watermark palette (pre-pastel) from backup...

if not exist "src.pre-watermark-pastel\watermarkStyle.ts" (
  echo ERROR: src.pre-watermark-pastel backup not found.
  exit /b 1
)

copy /Y "src.pre-watermark-pastel\watermarkStyle.ts" "src\services\watermarkStyle.ts" >nul

if exist "public.pre-watermark-pastel\watermark-export.js" (
  copy /Y "public.pre-watermark-pastel\watermark-export.js" "public\report\watermark-export.js" >nul
)

echo Done. Rebuild APK and redeploy if needed.
endlocal
