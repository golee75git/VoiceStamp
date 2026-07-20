@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-apk-download-export-site-folder\landing.html" (
  echo Backup not found: public.pre-apk-download-export-site-folder
  exit /b 1
)
copy /Y "public.pre-apk-download-export-site-folder\landing.html" "public\landing.html"
copy /Y "public.pre-apk-download-export-site-folder\info.html" "public\info.html"
if exist "public.pre-apk-download-export-site-folder\apkBuildLabel.ts" (
  copy /Y "public.pre-apk-download-export-site-folder\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
echo Restored APK download links from public.pre-apk-download-export-site-folder
