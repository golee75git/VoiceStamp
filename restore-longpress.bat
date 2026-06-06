@echo off
cd /d "%~dp0"
if not exist "src.pre-longpress\components\StampListScreen.tsx" (
  echo ERROR: src.pre-longpress backup not found.
  exit /b 1
)
copy /Y "src.pre-longpress\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
echo Restored long-press selection files
