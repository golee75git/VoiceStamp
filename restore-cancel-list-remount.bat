@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-cancel-list-remount\components\StampListScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-cancel-list-remount\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-cancel-list-remount\help.html" copy /Y "public.pre-cancel-list-remount\help.html" "public\help.html" >nul
echo Restored cancel-list-remount.
endlocal
