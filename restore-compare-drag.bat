@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-compare-drag\components\FollowLinkCompareSheet.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-compare-drag\components\FollowLinkCompareSheet.tsx" "src\components\FollowLinkCompareSheet.tsx" >nul
copy /Y "src.pre-compare-drag\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
if exist "public.pre-compare-drag\help.html" copy /Y "public.pre-compare-drag\help.html" "public\help.html" >nul
if exist "public.pre-compare-drag\landing.html" copy /Y "public.pre-compare-drag\landing.html" "public\landing.html" >nul
if exist "public.pre-compare-drag\info.html" copy /Y "public.pre-compare-drag\info.html" "public\info.html" >nul
echo Restored compare-drag.
endlocal
