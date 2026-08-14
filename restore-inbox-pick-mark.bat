@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-inbox-pick-mark\components\ProjectCollectScreen.tsx" "%ROOT%src\components\ProjectCollectScreen.tsx"
if exist "%ROOT%public.pre-inbox-pick-mark\help.html" copy /Y "%ROOT%public.pre-inbox-pick-mark\help.html" "%ROOT%public\help.html"
echo Restored inbox-pick-mark snapshot.
