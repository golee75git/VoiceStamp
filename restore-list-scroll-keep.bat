@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-list-scroll-keep\components\StampListScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-list-scroll-keep\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-list-scroll-keep\help.html" copy /Y "public.pre-list-scroll-keep\help.html" "public\help.html" >nul
echo Restored list-scroll-keep.
endlocal
