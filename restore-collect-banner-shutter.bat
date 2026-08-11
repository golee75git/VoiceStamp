@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-collect-banner-shutter\components\CameraScreen.tsx" "%ROOT%src\components\CameraScreen.tsx"
copy /Y "%ROOT%public.pre-collect-banner-shutter\help.html" "%ROOT%public\help.html"
echo Restored collect-banner-shutter snapshots
pause
