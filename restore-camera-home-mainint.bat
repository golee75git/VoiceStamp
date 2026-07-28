@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "assets.pre-camera-home-mainint\camera-home.png" (
  echo Backup not found: assets.pre-camera-home-mainint
  exit /b 1
)
copy /Y "assets.pre-camera-home-mainint\camera-home.png" "assets\camera-home.png"
if exist "public.pre-camera-home-mainint\help.html" (
  copy /Y "public.pre-camera-home-mainint\help.html" "public\help.html"
)
echo Restored camera-home.png from assets.pre-camera-home-mainint
