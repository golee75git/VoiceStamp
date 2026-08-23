@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-follow-xlsx-photo-px\components\FollowLinkCompareSheet.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-follow-xlsx-photo-px\components\FollowLinkCompareSheet.tsx" "src\components\FollowLinkCompareSheet.tsx" >nul
if exist "public.pre-follow-xlsx-photo-px\help.html" copy /Y "public.pre-follow-xlsx-photo-px\help.html" "public\help.html" >nul
echo Restored follow-xlsx-photo-px. Reload Metro.
endlocal
