@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-chrome-scroll-adj\components\StampListScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-chrome-scroll-adj\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-chrome-scroll-adj\help.html" copy /Y "public.pre-chrome-scroll-adj\help.html" "public\help.html" >nul
echo Restored chrome-scroll-adj.
endlocal
