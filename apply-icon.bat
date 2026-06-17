@echo off
setlocal
cd /d "%~dp0"
set "SRC=%~dp0assets\app-icon-source.png"
if not exist "%SRC%" (
  echo ERROR: Source icon image not found: %SRC%
  exit /b 1
)
if not exist "assets.pre-icon" (
  xcopy "assets" "assets.pre-icon\" /E /I /Y >nul
  echo Created backup assets.pre-icon
)
copy /Y "%SRC%" "assets\icon.png" >nul
copy /Y "%SRC%" "assets\android-icon-foreground.png" >nul
copy /Y "%SRC%" "assets\favicon.png" >nul
echo Applied icon to assets\icon.png, android-icon-foreground.png, favicon.png
echo Run: npx expo prebuild --platform android --no-install
echo Then rebuild APK with build-apk.bat
exit /b 0
