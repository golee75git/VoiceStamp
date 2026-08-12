@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "android.pre-join-app-links\app\src\main\AndroidManifest.xml" (
  echo [ERROR] Missing android snapshot
  exit /b 1
)
if not exist "public.pre-join-app-links\join.html" (
  echo [ERROR] Missing public snapshot
  exit /b 1
)

copy /Y "android.pre-join-app-links\app\src\main\AndroidManifest.xml" "android\app\src\main\AndroidManifest.xml" >nul
copy /Y "public.pre-join-app-links\join.html" "public\join.html" >nul
copy /Y "public.pre-join-app-links\help.html" "public\help.html" >nul
copy /Y "public.pre-join-app-links\app.json" "app.json" >nul
copy /Y "public.pre-join-app-links\vercel.json" "vercel.json" >nul
if exist "public.pre-join-app-links\post-export-web-layout.mjs" copy /Y "public.pre-join-app-links\post-export-web-layout.mjs" "scripts\post-export-web-layout.mjs" >nul

if exist "public\.well-known\assetlinks.json" del /F /Q "public\.well-known\assetlinks.json" >nul 2>&1

echo Restored join-app-links files. Rebuild APK after restore.
exit /b 0
