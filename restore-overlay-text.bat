@echo off
setlocal
cd /d "%~dp0"

echo Restoring overlay-text files from backup...

if not exist "src.pre-overlay-text\services" (
  echo ERROR: src.pre-overlay-text backup not found.
  exit /b 1
)

robocopy "src.pre-overlay-text\services" "src\services" /E /NFL /NDL /NJH /NJS /nc /ns /np >nul
if exist "public.pre-overlay-text\watermark-export.js" (
  copy /Y "public.pre-overlay-text\watermark-export.js" "public\report\watermark-export.js" >nul
)

if exist "src.pre-overlay-text\components" (
  robocopy "src.pre-overlay-text\components" "src\components" /E /NFL /NDL /NJH /NJS /nc /ns /np >nul
)

if exist "src\services\overlayText.ts" del /Q "src\services\overlayText.ts"

echo Done. Rebuild APK and redeploy if needed.
endlocal
