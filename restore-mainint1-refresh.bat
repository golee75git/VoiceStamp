@echo off
REM Restores mainint1.png + landing/info/apk label from *.pre-mainint1-refresh/
set ROOT=%~dp0
copy /Y "%ROOT%assets.pre-mainint1-refresh\mainint1.png" "%ROOT%assets\mainint1.png"
copy /Y "%ROOT%public.pre-mainint1-refresh\landing.html" "%ROOT%public\landing.html"
copy /Y "%ROOT%public.pre-mainint1-refresh\info.html" "%ROOT%public\info.html"
copy /Y "%ROOT%public.pre-mainint1-refresh\help.html" "%ROOT%public\help.html"
copy /Y "%ROOT%src.pre-mainint1-refresh\constants\apkBuildLabel.ts" "%ROOT%src\constants\apkBuildLabel.ts"
echo Restored mainint1.png + landing/info/help + apkBuildLabel from *.pre-mainint1-refresh/
pause
