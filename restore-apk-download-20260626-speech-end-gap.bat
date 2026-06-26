@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-apk-download-20260626-speech-end-gap\landing.html" (
  echo Backup not found: public.pre-apk-download-20260626-speech-end-gap
  exit /b 1
)
copy /Y "public.pre-apk-download-20260626-speech-end-gap\landing.html" "public\landing.html"
copy /Y "public.pre-apk-download-20260626-speech-end-gap\info.html" "public\info.html"
echo Restored landing/info APK links from public.pre-apk-download-20260626-speech-end-gap
