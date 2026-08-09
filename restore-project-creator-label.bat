@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-project-creator-label\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-project-creator-label\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "src.pre-project-creator-label\services\projectCollectSettings.ts" "src\services\projectCollectSettings.ts" >nul
if exist "public.pre-project-creator-label\help.html" copy /Y "public.pre-project-creator-label\help.html" "public\help.html" >nul
echo Restored project-creator-label.
endlocal
