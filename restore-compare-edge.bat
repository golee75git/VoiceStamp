@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-compare-edge\components\FollowLinkCompareSheet.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-compare-edge\components\FollowLinkCompareSheet.tsx" "src\components\FollowLinkCompareSheet.tsx" >nul
copy /Y "src.pre-compare-edge\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
if exist "public.pre-compare-edge\help.html" copy /Y "public.pre-compare-edge\help.html" "public\help.html" >nul
if exist "public.pre-compare-edge\landing.html" copy /Y "public.pre-compare-edge\landing.html" "public\landing.html" >nul
if exist "public.pre-compare-edge\info.html" copy /Y "public.pre-compare-edge\info.html" "public\info.html" >nul
echo Restored compare-edge.
endlocal
