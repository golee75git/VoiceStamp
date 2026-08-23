@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-list-xlsx-photo-px\components\StampListScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-list-xlsx-photo-px\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-list-xlsx-photo-px\help.html" copy /Y "public.pre-list-xlsx-photo-px\help.html" "public\help.html" >nul
echo Restored list-xlsx-photo-px. Reload Metro.
endlocal
