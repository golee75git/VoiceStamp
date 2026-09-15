@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-note-pad-press\components\StampSaveZoomViewer.tsx" copy /Y "src.pre-note-pad-press\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx" >nul
if exist "src.pre-note-pad-press\components\PhotoNotePadLayer.tsx" copy /Y "src.pre-note-pad-press\components\PhotoNotePadLayer.tsx" "src\components\PhotoNotePadLayer.tsx" >nul
if exist "src.pre-note-pad-press\components\StampSaveModal.tsx" copy /Y "src.pre-note-pad-press\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "src.pre-note-pad-press\services\photoNotePad.ts" copy /Y "src.pre-note-pad-press\services\photoNotePad.ts" "src\services\photoNotePad.ts" >nul
if exist "public.pre-note-pad-press\help.html" copy /Y "public.pre-note-pad-press\help.html" "public\help.html" >nul
echo Restored note-pad-press (pre add-button outside scroll). Reload Metro.
endlocal
