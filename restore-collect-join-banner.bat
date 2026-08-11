@echo off
REM Restores CameraScreen, StampSaveModal, help from *.pre-collect-join-banner/
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-collect-join-banner\components\CameraScreen.tsx" "%ROOT%src\components\CameraScreen.tsx"
copy /Y "%ROOT%src.pre-collect-join-banner\components\StampSaveModal.tsx" "%ROOT%src\components\StampSaveModal.tsx"
copy /Y "%ROOT%public.pre-collect-join-banner\help.html" "%ROOT%public\help.html"
echo Restored collect-join-banner snapshots
pause
