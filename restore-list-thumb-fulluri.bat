@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-list-thumb-fulluri\components\StampListThumb.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-list-thumb-fulluri\components\StampListThumb.tsx" "src\components\StampListThumb.tsx" >nul
copy /Y "src.pre-list-thumb-fulluri\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-list-thumb-fulluri\help.html" copy /Y "public.pre-list-thumb-fulluri\help.html" "public\help.html" >nul
echo Restored list-thumb-fulluri.
endlocal
