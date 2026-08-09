@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-project-sent-list\services\projectCollectSettings.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-project-sent-list\services\projectCollectSettings.ts" "src\services\projectCollectSettings.ts" >nul
copy /Y "src.pre-project-sent-list\services\projectUploadQueue.ts" "src\services\projectUploadQueue.ts" >nul
copy /Y "src.pre-project-sent-list\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "src.pre-project-sent-list\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
copy /Y "src.pre-project-sent-list\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
if exist "src\components\ProjectSentList.tsx" del /F /Q "src\components\ProjectSentList.tsx" >nul
if exist "public.pre-project-sent-list\help.html" copy /Y "public.pre-project-sent-list\help.html" "public\help.html" >nul
echo Restored project-sent-list.
endlocal
