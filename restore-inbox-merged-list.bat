@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-inbox-merged-list\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-inbox-merged-list\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "src.pre-inbox-merged-list\components\ProjectImportedList.tsx" "src\components\ProjectImportedList.tsx" >nul
copy /Y "src.pre-inbox-merged-list\services\projectImportedStamps.ts" "src\services\projectImportedStamps.ts" >nul
if exist "public.pre-inbox-merged-list\help.html" copy /Y "public.pre-inbox-merged-list\help.html" "public\help.html" >nul
echo Restored inbox merged list. Reload Metro.
endlocal
