@echo off
REM Restores broken landing/info from before UTF-8 fix (for undo of this fix only).
REM To recover a working site again, re-copy from public.pre-mainint1-refresh and set APK name.
set ROOT=%~dp0
copy /Y "%ROOT%public.pre-landing-utf8-fix\landing.html" "%ROOT%public\landing.html"
copy /Y "%ROOT%public.pre-landing-utf8-fix\info.html" "%ROOT%public\info.html"
echo Restored pre-fix (broken) landing/info — re-run UTF-8 restore if needed
pause
