@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-album-hold\services\fileService.ts" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-album-hold\services\fileService.ts" "src\services\fileService.ts" >nul
copy /Y "src.pre-album-hold\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "public.pre-album-hold\help.html" copy /Y "public.pre-album-hold\help.html" "public\help.html" >nul
echo Restored album-hold.
endlocal
