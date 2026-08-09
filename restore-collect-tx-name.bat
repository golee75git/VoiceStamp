@echo off
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-collect-tx-name\components\StampSaveModal.tsx" "%ROOT%src\components\StampSaveModal.tsx"
if exist "%ROOT%public.pre-collect-tx-name\help.html" copy /Y "%ROOT%public.pre-collect-tx-name\help.html" "%ROOT%public\help.html"
echo Restored collect-tx-name snapshot.
