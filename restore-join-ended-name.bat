@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-join-ended-name\services\joinEndedNotice.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-join-ended-name\services\joinEndedNotice.ts" "src\services\joinEndedNotice.ts" >nul
if exist "public.pre-join-ended-name\help.html" copy /Y "public.pre-join-ended-name\help.html" "public\help.html" >nul
echo Restored join ended name. Reload Metro.
endlocal
