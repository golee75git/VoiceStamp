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
python "%~dp0scripts\apply-icon-safezone.py"
if errorlevel 1 exit /b 1
echo Run: npx expo prebuild --platform android --no-install
echo Then rebuild APK with build-apk.bat
exit /b 0
