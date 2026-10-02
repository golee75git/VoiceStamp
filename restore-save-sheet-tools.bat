@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-save-sheet-tools\components\StampSaveModal.tsx" copy /Y "src.pre-save-sheet-tools\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "src.pre-save-sheet-tools\components\SettingsScreen.tsx" copy /Y "src.pre-save-sheet-tools\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
if exist "src.pre-save-sheet-tools\services\settingsService.ts" copy /Y "src.pre-save-sheet-tools\services\settingsService.ts" "src\services\settingsService.ts" >nul
if exist "public.pre-save-sheet-tools\help.html" copy /Y "public.pre-save-sheet-tools\help.html" "public\help.html" >nul
echo Restored save-sheet-tools (image-save button and QR URL field visibility). Reload Metro.
endlocal
