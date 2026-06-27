@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-landing-share\landing.html" (
  echo Backup not found: public.pre-landing-share
  exit /b 1
)
copy /Y "public.pre-landing-share\landing.html" "public\landing.html"
if exist "public\vendor\qrcode.min.js" del /Q "public\vendor\qrcode.min.js"
if exist "public\vendor\qrcodejs-LICENSE.txt" del /Q "public\vendor\qrcodejs-LICENSE.txt"
echo Restored landing share rollback
