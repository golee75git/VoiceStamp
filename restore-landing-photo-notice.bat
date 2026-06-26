@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-landing-photo-notice\landing.html" (
  echo Backup not found: public.pre-landing-photo-notice
  exit /b 1
)
copy /Y "public.pre-landing-photo-notice\landing.html" "public\landing.html"
echo Restored landing.html from public.pre-landing-photo-notice
