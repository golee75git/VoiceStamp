@echo off
REM Restores public/join.html + help.html from public.pre-join-kakao-fallback/
set ROOT=%~dp0
xcopy /E /I /Y "%ROOT%public.pre-join-kakao-fallback\join.html" "%ROOT%public\join.html"
xcopy /E /I /Y "%ROOT%public.pre-join-kakao-fallback\help.html" "%ROOT%public\help.html"
echo Restored join.html + help.html from public.pre-join-kakao-fallback
pause
