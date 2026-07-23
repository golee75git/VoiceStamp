@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-home-nav-icons\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-home-nav-icons
  exit /b 1
)
copy /Y "src.pre-home-nav-icons\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
if exist "src.pre-home-nav-icons\assets\template-icon.png" copy /Y "src.pre-home-nav-icons\assets\template-icon.png" "assets\template-icon.png"
if exist "src.pre-home-nav-icons\public\help.html" copy /Y "src.pre-home-nav-icons\public\help.html" "public\help.html"
if exist "src.pre-home-nav-icons\public\landing.html" copy /Y "src.pre-home-nav-icons\public\landing.html" "public\landing.html"
if exist "src.pre-home-nav-icons\public\info.html" copy /Y "src.pre-home-nav-icons\public\info.html" "public\info.html"
if exist "src.pre-home-nav-icons\constants\apkBuildLabel.ts" copy /Y "src.pre-home-nav-icons\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored home-nav-icons from src.pre-home-nav-icons
