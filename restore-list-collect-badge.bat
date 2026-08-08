@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-list-collect-badge\components\StampListScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-list-collect-badge\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-list-collect-badge\help.html" copy /Y "public.pre-list-collect-badge\help.html" "public\help.html" >nul
echo Restored list collect badges. Reload Metro.
endlocal
