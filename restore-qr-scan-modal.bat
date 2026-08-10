@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-qr-scan-modal\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
if exist "%ROOT%public.pre-qr-scan-modal\help.html" copy /Y "%ROOT%public.pre-qr-scan-modal\help.html" "%ROOT%public\help.html"
echo Restored qr-scan-modal snapshot.
