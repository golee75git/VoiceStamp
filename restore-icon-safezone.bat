@echo off
setlocal
cd /d "%~dp0"
if not exist "assets.pre-icon-fullbleed\icon.png" (
  echo Backup not found: assets.pre-icon-fullbleed
  exit /b 1
)
copy /Y "assets.pre-icon-fullbleed\icon.png" "assets\icon.png" >nul
copy /Y "assets.pre-icon-fullbleed\android-icon-foreground.png" "assets\android-icon-foreground.png" >nul
copy /Y "assets.pre-icon-fullbleed\favicon.png" "assets\favicon.png" >nul
if exist "assets.pre-icon-fullbleed\android-icon-background.png" (
  copy /Y "assets.pre-icon-fullbleed\android-icon-background.png" "assets\android-icon-background.png" >nul
)
echo Restored full-bleed icons from assets.pre-icon-fullbleed
