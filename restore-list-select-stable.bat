@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-list-select-stable\components\StampListScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-list-select-stable\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-list-select-stable\help.html" copy /Y "public.pre-list-select-stable\help.html" "public\help.html" >nul
echo Restored list-select-stable.
endlocal
