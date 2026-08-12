@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "src.pre-collect-link-flag\screens\MainScreen.tsx" (
  echo [ERROR] Missing snapshot
  exit /b 1
)

copy /Y "src.pre-collect-link-flag\screens\MainScreen.tsx" "src\screens\MainScreen.tsx" >nul
if exist "public.pre-collect-link-flag\help.html" copy /Y "public.pre-collect-link-flag\help.html" "public\help.html" >nul

echo Restored collect-link-flag files from *.pre-collect-link-flag
exit /b 0
