@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "public.pre-apk-download-20260731_102403\landing.html" copy /Y "public.pre-apk-download-20260731_102403\landing.html" "public\landing.html" >nul
if exist "public.pre-apk-download-20260731_102403\info.html" copy /Y "public.pre-apk-download-20260731_102403\info.html" "public\info.html" >nul
if exist "public.pre-apk-download-20260731_102403\apkBuildLabel.ts" copy /Y "public.pre-apk-download-20260731_102403\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
echo Restored apk-download-20260731_102403
