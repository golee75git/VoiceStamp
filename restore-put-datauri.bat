@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-put-datauri\services\projectUploadQueue.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-put-datauri\services\projectUploadQueue.ts" "src\services\projectUploadQueue.ts" >nul
echo Restored put-datauri.
endlocal
