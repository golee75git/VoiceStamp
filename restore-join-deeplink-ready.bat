@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "src.pre-join-deeplink-ready\components\ProjectCollectScreen.tsx" (
  echo [ERROR] Missing snapshot
  exit /b 1
)

copy /Y "src.pre-join-deeplink-ready\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "src.pre-join-deeplink-ready\screens\MainScreen.tsx" "src\screens\MainScreen.tsx" >nul
if exist "public.pre-join-deeplink-ready\help.html" copy /Y "public.pre-join-deeplink-ready\help.html" "public\help.html" >nul
if exist "public.pre-join-deeplink-ready\join.html" copy /Y "public.pre-join-deeplink-ready\join.html" "public\join.html" >nul

echo Restored join deeplink-ready files from *.pre-join-deeplink-ready
exit /b 0
