@echo off
REM Restore public landing/info from snapshot before UTF-8 fix (2026-09-10).
copy /Y "public.pre-landing-utf8-fix\landing.html" "public\landing.html"
if exist "public.pre-landing-utf8-fix\info.html" copy /Y "public.pre-landing-utf8-fix\info.html" "public\info.html"
echo Restored public\landing.html (and info.html if present) from public.pre-landing-utf8-fix
pause
