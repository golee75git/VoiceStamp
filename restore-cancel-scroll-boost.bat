@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-cancel-scroll-boost\components\StampListScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-cancel-scroll-boost\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-cancel-scroll-boost\help.html" copy /Y "public.pre-cancel-scroll-boost\help.html" "public\help.html" >nul
echo Restored cancel-scroll-boost.
endlocal
