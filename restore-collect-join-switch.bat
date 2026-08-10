@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-collect-join-switch\components\StampSaveModal.tsx" "%ROOT%src\components\StampSaveModal.tsx"
if exist "%ROOT%public.pre-collect-join-switch\help.html" copy /Y "%ROOT%public.pre-collect-join-switch\help.html" "%ROOT%public\help.html"
echo Restored collect-join-switch snapshot.
