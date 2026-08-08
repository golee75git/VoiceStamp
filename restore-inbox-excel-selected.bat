@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-inbox-excel-selected\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-inbox-excel-selected\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "public.pre-inbox-excel-selected\help.html" copy /Y "public.pre-inbox-excel-selected\help.html" "public\help.html" >nul
echo Restored inbox selected excel. Reload Metro.
endlocal
