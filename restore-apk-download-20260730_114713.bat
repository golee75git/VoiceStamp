@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "public.pre-apk-download-20260730_114713\landing.html" copy /Y "public.pre-apk-download-20260730_114713\landing.html" "public\landing.html" >nul
if exist "public.pre-apk-download-20260730_114713\info.html" copy /Y "public.pre-apk-download-20260730_114713\info.html" "public\info.html" >nul
if exist "public.pre-apk-download-20260730_114713\apkBuildLabel.ts" copy /Y "public.pre-apk-download-20260730_114713\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
echo Restored apk-download-20260730_114713
