@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-owned-project-list\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-owned-project-list\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
if exist "public.pre-owned-project-list\help.html" copy /Y "public.pre-owned-project-list\help.html" "public\help.html" >nul
echo Restored single-project hub UI. Reload Metro after restore.
endlocal
