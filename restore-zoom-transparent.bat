@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "assets.pre-zoom-transparent\zoom.png" (
  echo Backup not found: assets.pre-zoom-transparent
  exit /b 1
)
copy /Y "assets.pre-zoom-transparent\zoom.png" "assets\zoom.png"
echo Restored zoom.png from assets.pre-zoom-transparent
