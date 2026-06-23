@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-landing-privacy\landing.html" (
  echo Backup not found: public.pre-landing-privacy
  exit /b 1
)
copy /Y "public.pre-landing-privacy\landing.html" "public\landing.html"
echo Restored landing.html from public.pre-landing-privacy
