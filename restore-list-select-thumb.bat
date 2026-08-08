@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-list-select-thumb\components\StampListThumb.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-list-select-thumb\components\StampListThumb.tsx" "src\components\StampListThumb.tsx" >nul
copy /Y "src.pre-list-select-thumb\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-list-select-thumb\help.html" copy /Y "public.pre-list-select-thumb\help.html" "public\help.html" >nul
echo Restored list-select-thumb.
endlocal
