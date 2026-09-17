@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-note-pad-rise\components\PhotoNotePadLayer.tsx" copy /Y "src.pre-note-pad-rise\components\PhotoNotePadLayer.tsx" "src\components\PhotoNotePadLayer.tsx" >nul
if exist "public.pre-note-pad-rise\help.html" copy /Y "public.pre-note-pad-rise\help.html" "public\help.html" >nul
echo Restored note-pad-rise (before vertical text-origin match). Reload Metro.
endlocal
