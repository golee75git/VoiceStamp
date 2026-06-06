@echo off
setlocal
cd /d "%~dp0"
if not exist "assets.pre-icon" (
  echo ERROR: assets.pre-icon backup not found.
  exit /b 1
)
if exist "assets" rmdir /s /q assets
xcopy "assets.pre-icon" "assets\" /E /I /Y >nul
echo Restored assets from assets.pre-icon
exit /b 0
