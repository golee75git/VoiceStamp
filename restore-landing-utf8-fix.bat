@echo off
REM Restore broken/pre-fix landing.html
copy /Y "%~dp0public.pre-landing-utf8-fix\landing.html" "%~dp0public\landing.html"
echo Restored public\landing.html from public.pre-landing-utf8-fix
