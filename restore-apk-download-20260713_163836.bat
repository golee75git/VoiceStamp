@echo off
setlocal
if not exist "public.pre-apk-download-20260713-163836\landing.html" (
  echo Backup not found: public.pre-apk-download-20260713-163836
  exit /b 1
)
copy /Y "public.pre-apk-download-20260713-163836\landing.html" "public\landing.html"
copy /Y "public.pre-apk-download-20260713-163836\info.html" "public\info.html"
echo Restored APK download links from public.pre-apk-download-20260713-163836
