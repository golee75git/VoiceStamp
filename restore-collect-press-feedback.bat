@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-collect-press-feedback\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
copy /Y "%ROOT%public.pre-collect-press-feedback\help.html" "%ROOT%public\help.html"
echo Restored collect-press-feedback snapshots
pause
