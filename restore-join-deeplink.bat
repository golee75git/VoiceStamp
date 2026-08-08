@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-join-deeplink\screens\MainScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-join-deeplink\App.tsx" "App.tsx" >nul
copy /Y "src.pre-join-deeplink\app.json" "app.json" >nul
copy /Y "src.pre-join-deeplink\screens\MainScreen.tsx" "src\screens\MainScreen.tsx" >nul
copy /Y "src.pre-join-deeplink\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "public.pre-join-deeplink\join.html" copy /Y "public.pre-join-deeplink\join.html" "public\join.html" >nul
if exist "public.pre-join-deeplink\help.html" copy /Y "public.pre-join-deeplink\help.html" "public\help.html" >nul
if exist "src\services\projectJoinLink.ts" del "src\services\projectJoinLink.ts" >nul
echo Restored pre-join-deeplink. Rebuild native APK after app.json change. Reload Metro.
endlocal
