@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-sent-bar-inset\components\ProjectSentList.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-sent-bar-inset\components\ProjectSentList.tsx" "src\components\ProjectSentList.tsx" >nul
if exist "public.pre-sent-bar-inset\help.html" copy /Y "public.pre-sent-bar-inset\help.html" "public\help.html" >nul
echo Restored sent bar inset. Reload Metro.
endlocal
