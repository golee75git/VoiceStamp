@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-inbox-on-device\components\ProjectCollectScreen.tsx" copy /Y "src.pre-inbox-on-device\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "src.pre-inbox-on-device\services\projectImportedStamps.ts" copy /Y "src.pre-inbox-on-device\services\projectImportedStamps.ts" "src\services\projectImportedStamps.ts" >nul
if exist "public.pre-inbox-on-device\help.html" copy /Y "public.pre-inbox-on-device\help.html" "public\help.html" >nul
echo Restored inbox-on-device (pre inbox showing this-phone thumbs). Reload Metro.
endlocal
