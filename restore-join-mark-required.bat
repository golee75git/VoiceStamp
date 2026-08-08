@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-join-mark-required\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-join-mark-required\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "public.pre-join-mark-required\help.html" copy /Y "public.pre-join-mark-required\help.html" "public\help.html" >nul
echo Restored optional join mark behavior. Reload Metro after restore.
endlocal
