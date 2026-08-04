@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-landing-hero\landing.html" (
  echo Backup not found: public.pre-landing-hero
  exit /b 1
)
copy /Y "public.pre-landing-hero\landing.html" "public\landing.html"
if exist "public.pre-landing-hero\help.html" (
  copy /Y "public.pre-landing-hero\help.html" "public\help.html"
)
echo Restored landing-hero from public.pre-landing-hero
echo Note: hero PNG files in public\ and assets\ are kept. Delete manually if needed.
