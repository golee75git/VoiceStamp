@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-note-pad-tune\components\PhotoNotePadLayer.tsx" copy /Y "src.pre-note-pad-tune\components\PhotoNotePadLayer.tsx" "src\components\PhotoNotePadLayer.tsx" >nul
if exist "src.pre-note-pad-tune\components\StampSaveZoomViewer.tsx" copy /Y "src.pre-note-pad-tune\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx" >nul
if exist "src.pre-note-pad-tune\components\StampSaveModal.tsx" copy /Y "src.pre-note-pad-tune\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "src.pre-note-pad-tune\components\StampSavePreview.tsx" copy /Y "src.pre-note-pad-tune\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx" >nul
if exist "src.pre-note-pad-tune\services\photoNotePad.ts" copy /Y "src.pre-note-pad-tune\services\photoNotePad.ts" "src\services\photoNotePad.ts" >nul
if exist "src.pre-note-pad-tune\services\applyPhotoNotePad.ts" copy /Y "src.pre-note-pad-tune\services\applyPhotoNotePad.ts" "src\services\applyPhotoNotePad.ts" >nul
if exist "src\services\photoNoteStyle.ts" del /Q "src\services\photoNoteStyle.ts" >nul
if exist "public.pre-note-pad-tune\help.html" copy /Y "public.pre-note-pad-tune\help.html" "public\help.html" >nul
echo Restored note-pad-tune (before 글 넣기, sliders, text-box origin). Reload Metro.
endlocal
