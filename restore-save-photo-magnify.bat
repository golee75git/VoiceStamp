@echo off
setlocal
cd /d "%~dp0"
echo Restoring save-viewer photo magnify snapshot...
copy /Y "src.pre-save-photo-magnify\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-save-photo-magnify\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "public.pre-save-photo-magnify\help.html" "public\help.html"
if exist "src\components\SavePhotoMagnifier.tsx" del /F /Q "src\components\SavePhotoMagnifier.tsx"
echo Done. Rebuild the app to drop the large-view pinch.
endlocal
