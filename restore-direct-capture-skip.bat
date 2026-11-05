@echo off
REM Restore the slower open-on-launch path before the home splash was skipped.
setlocal
set "ROOT=%~dp0"
copy /Y "%ROOT%src.pre-direct-capture-skip\App.tsx" "%ROOT%App.tsx" >nul
copy /Y "%ROOT%src.pre-direct-capture-skip\services\settingsService.ts" "%ROOT%src\services\settingsService.ts" >nul
copy /Y "%ROOT%src.pre-direct-capture-skip\components\CameraScreen.tsx" "%ROOT%src\components\CameraScreen.tsx" >nul
copy /Y "%ROOT%src.pre-direct-capture-skip\screens\MainScreen.tsx" "%ROOT%src\screens\MainScreen.tsx" >nul
copy /Y "%ROOT%public.pre-direct-capture-skip\help.html" "%ROOT%public\help.html" >nul
echo restored direct capture skip
endlocal
