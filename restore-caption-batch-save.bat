@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-caption-batch-save\services\exportStampImage.ts" copy /Y "src.pre-caption-batch-save\services\exportStampImage.ts" "src\services\exportStampImage.ts" >nul
if exist "src.pre-caption-batch-save\services\renderStampCaptionNative.ts" copy /Y "src.pre-caption-batch-save\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts" >nul
if exist "src.pre-caption-batch-save\apkBuildLabel.ts" copy /Y "src.pre-caption-batch-save\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
if exist "public.pre-caption-batch-save\help.html" copy /Y "public.pre-caption-batch-save\help.html" "public\help.html" >nul
if exist "public.pre-caption-batch-save\landing.html" copy /Y "public.pre-caption-batch-save\landing.html" "public\landing.html" >nul
if exist "public.pre-caption-batch-save\info.html" copy /Y "public.pre-caption-batch-save\info.html" "public\info.html" >nul
echo Restored caption-batch-save (before separate caption rules and photo bitmap release). Reload Metro.
endlocal
