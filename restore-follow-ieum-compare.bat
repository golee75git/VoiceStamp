@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-follow-ieum-compare\components\FollowLinkCompareSheet.tsx" (
  echo Backup not found: src.pre-follow-ieum-compare
  exit /b 1
)
copy /Y "src.pre-follow-ieum-compare\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-follow-ieum-compare\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-follow-ieum-compare\components\FollowLinkCompareSheet.tsx" "src\components\FollowLinkCompareSheet.tsx"
if exist "public.pre-follow-ieum-compare\help.html" (
  copy /Y "public.pre-follow-ieum-compare\help.html" "public\help.html"
)
echo Restored follow-ieum-compare from src.pre-follow-ieum-compare / public.pre-follow-ieum-compare
endlocal
