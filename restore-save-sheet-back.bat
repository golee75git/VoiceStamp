@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-save-sheet-back\components\StampSaveModal.tsx" copy /Y "src.pre-save-sheet-back\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "src.pre-save-sheet-back\components\CameraScreen.tsx" copy /Y "src.pre-save-sheet-back\components\CameraScreen.tsx" "src\components\CameraScreen.tsx" >nul
if exist "public.pre-save-sheet-back\help.html" copy /Y "public.pre-save-sheet-back\help.html" "public\help.html" >nul
echo Restored save-sheet-back (pre hardware back staying on a blank save sheet). Reload Metro.
endlocal
