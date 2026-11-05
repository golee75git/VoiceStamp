@echo off
REM Restore open-on-launch setting before 2026-11-05.
setlocal
set "ROOT=%~dp0"
copy /Y "%ROOT%src.pre-resume-saved-capture\App.tsx" "%ROOT%App.tsx" >nul
copy /Y "%ROOT%src.pre-resume-saved-capture\services\settingsService.ts" "%ROOT%src\services\settingsService.ts" >nul
copy /Y "%ROOT%src.pre-resume-saved-capture\services\projectJoinLink.ts" "%ROOT%src\services\projectJoinLink.ts" >nul
copy /Y "%ROOT%src.pre-resume-saved-capture\components\SettingsScreen.tsx" "%ROOT%src\components\SettingsScreen.tsx" >nul
copy /Y "%ROOT%src.pre-resume-saved-capture\components\CameraScreen.tsx" "%ROOT%src\components\CameraScreen.tsx" >nul
copy /Y "%ROOT%src.pre-resume-saved-capture\screens\MainScreen.tsx" "%ROOT%src\screens\MainScreen.tsx" >nul
copy /Y "%ROOT%public.pre-resume-saved-capture\help.html" "%ROOT%public\help.html" >nul
echo restored open-on-launch setting files
endlocal
