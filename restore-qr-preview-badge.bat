@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-qr-preview-badge\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
copy /Y "%ROOT%src.pre-qr-preview-badge\components\StampSaveModal.tsx" "%ROOT%src\components\StampSaveModal.tsx"
if exist "%ROOT%public.pre-qr-preview-badge\help.html" copy /Y "%ROOT%public.pre-qr-preview-badge\help.html" "%ROOT%public\help.html"
echo Restored qr-preview-badge snapshot.
