@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-apk-download-20260706-111021\landing.html" (
  echo Backup not found: public.pre-apk-download-20260706-111021
  exit /b 1
)
copy /Y "public.pre-apk-download-20260706-111021\landing.html" "public\landing.html"
copy /Y "public.pre-apk-download-20260706-111021\info.html" "public\info.html"
echo Restored landing/info APK links from public.pre-apk-download-20260706-111021
