@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-photo-note-pad\db\schema.ts" copy /Y "src.pre-photo-note-pad\db\schema.ts" "src\db\schema.ts" >nul
if exist "src.pre-photo-note-pad\db\database.ts" copy /Y "src.pre-photo-note-pad\db\database.ts" "src\db\database.ts" >nul
if exist "src.pre-photo-note-pad\types\stamp.ts" copy /Y "src.pre-photo-note-pad\types\stamp.ts" "src\types\stamp.ts" >nul
if exist "src.pre-photo-note-pad\services\stampRepository.ts" copy /Y "src.pre-photo-note-pad\services\stampRepository.ts" "src\services\stampRepository.ts" >nul
if exist "src.pre-photo-note-pad\services\saveStamp.ts" copy /Y "src.pre-photo-note-pad\services\saveStamp.ts" "src\services\saveStamp.ts" >nul
if exist "src.pre-photo-note-pad\services\exportStampImage.ts" copy /Y "src.pre-photo-note-pad\services\exportStampImage.ts" "src\services\exportStampImage.ts" >nul
if exist "src.pre-photo-note-pad\services\renderStampWatermarkNative.ts" copy /Y "src.pre-photo-note-pad\services\renderStampWatermarkNative.ts" "src\services\renderStampWatermarkNative.ts" >nul
if exist "src.pre-photo-note-pad\services\renderStampCaptionNative.ts" copy /Y "src.pre-photo-note-pad\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts" >nul
if exist "src.pre-photo-note-pad\components\StampSavePreview.tsx" copy /Y "src.pre-photo-note-pad\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx" >nul
if exist "src.pre-photo-note-pad\components\StampSaveModal.tsx" copy /Y "src.pre-photo-note-pad\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "src.pre-photo-note-pad\components\StampSaveZoomViewer.tsx" copy /Y "src.pre-photo-note-pad\components\StampSaveZoomViewer.tsx" "src\components\StampSaveZoomViewer.tsx" >nul
if exist "src\services\photoNotePad.ts" del /Q "src\services\photoNotePad.ts" >nul
if exist "src\services\applyPhotoNotePad.ts" del /Q "src\services\applyPhotoNotePad.ts" >nul
if exist "src\components\PhotoNotePadLayer.tsx" del /Q "src\components\PhotoNotePadLayer.tsx" >nul
if exist "public.pre-photo-note-pad\help.html" copy /Y "public.pre-photo-note-pad\help.html" "public\help.html" >nul
echo Restored photo-note-pad (pre round notes on save/edit preview). Reload Metro.
endlocal
