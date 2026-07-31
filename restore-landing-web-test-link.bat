@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-landing-web-test-link\landing.html" (
  echo Backup not found: public.pre-landing-web-test-link
  exit /b 1
)
copy /Y "public.pre-landing-web-test-link\landing.html" "public\landing.html"
if exist "public.pre-landing-web-test-link\help.html" (
  copy /Y "public.pre-landing-web-test-link\help.html" "public\help.html"
)
echo Restored landing-web-test-link from public.pre-landing-web-test-link
