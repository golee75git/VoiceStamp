@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-import-progress-inset\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
copy /Y "%ROOT%public.pre-import-progress-inset\help.html" "%ROOT%public\help.html"
echo Restored import-progress-inset snapshots
pause
