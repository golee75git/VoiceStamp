@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-inbox-import-progress\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
copy /Y "%ROOT%public.pre-inbox-import-progress\help.html" "%ROOT%public\help.html"
echo Restored inbox-import-progress snapshots
pause
