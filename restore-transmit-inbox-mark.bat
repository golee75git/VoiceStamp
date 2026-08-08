@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-transmit-inbox-mark\components\StampListScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-transmit-inbox-mark\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
copy /Y "src.pre-transmit-inbox-mark\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "public.pre-transmit-inbox-mark\help.html" copy /Y "public.pre-transmit-inbox-mark\help.html" "public\help.html" >nul
echo Restored transmit badge / inbox imported mark. Reload Metro.
endlocal
