@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-save-core-slots\components\StampSaveModal.tsx" copy /Y "src.pre-save-core-slots\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "src.pre-save-core-slots\services\settingsService.ts" copy /Y "src.pre-save-core-slots\services\settingsService.ts" "src\services\settingsService.ts" >nul
if exist "public.pre-save-core-slots\help.html" copy /Y "public.pre-save-core-slots\help.html" "public\help.html" >nul
echo Restored save-core-slots (title, place, memo first; extra slots on demand). Reload Metro.
endlocal
