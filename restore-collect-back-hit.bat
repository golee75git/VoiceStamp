@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-collect-back-hit\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
copy /Y "%ROOT%src.pre-collect-back-hit\screens\MainScreen.tsx" "%ROOT%src\screens\MainScreen.tsx"
copy /Y "%ROOT%public.pre-collect-back-hit\help.html" "%ROOT%public\help.html"
echo Restored collect-back-hit snapshots
pause
