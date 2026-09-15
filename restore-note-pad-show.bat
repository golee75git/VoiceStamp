@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-note-pad-show\components\PhotoNotePadLayer.tsx" copy /Y "src.pre-note-pad-show\components\PhotoNotePadLayer.tsx" "src\components\PhotoNotePadLayer.tsx" >nul
if exist "src.pre-note-pad-show\components\StampSavePreview.tsx" copy /Y "src.pre-note-pad-show\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx" >nul
if exist "public.pre-note-pad-show\help.html" copy /Y "public.pre-note-pad-show\help.html" "public\help.html" >nul
echo Restored note-pad-show (pre pads painted on the photo view). Reload Metro.
endlocal
