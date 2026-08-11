@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-collect-banner-copy\components\CameraScreen.tsx" "%ROOT%src\components\CameraScreen.tsx"
copy /Y "%ROOT%public.pre-collect-banner-copy\help.html" "%ROOT%public\help.html"
echo Restored collect-banner-copy snapshots
pause
