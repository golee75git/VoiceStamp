@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-compare-order-title\components\FollowLinkCompareSheet.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-compare-order-title\components\FollowLinkCompareSheet.tsx" "src\components\FollowLinkCompareSheet.tsx" >nul
copy /Y "src.pre-compare-order-title\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
copy /Y "src.pre-compare-order-title\services\stampRepository.ts" "src\services\stampRepository.ts" >nul
copy /Y "src.pre-compare-order-title\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
if exist "public.pre-compare-order-title\help.html" copy /Y "public.pre-compare-order-title\help.html" "public\help.html" >nul
if exist "public.pre-compare-order-title\landing.html" copy /Y "public.pre-compare-order-title\landing.html" "public\landing.html" >nul
if exist "public.pre-compare-order-title\info.html" copy /Y "public.pre-compare-order-title\info.html" "public\info.html" >nul
echo Restored compare-order-title.
endlocal
