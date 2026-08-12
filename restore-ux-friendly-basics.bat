@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "src.pre-ux-friendly-basics\components\IntroScreen.tsx" (
  echo [ERROR] Missing snapshot
  exit /b 1
)

copy /Y "src.pre-ux-friendly-basics\components\IntroScreen.tsx" "src\components\IntroScreen.tsx" >nul
copy /Y "src.pre-ux-friendly-basics\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
if exist "public.pre-ux-friendly-basics\help.html" copy /Y "public.pre-ux-friendly-basics\help.html" "public\help.html" >nul

echo Restored ux-friendly-basics from *.pre-ux-friendly-basics
exit /b 0
