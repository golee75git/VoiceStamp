@echo off
cd /d "%~dp0"
if not exist "src.pre-responsive\components\StampListScreen.tsx" (
  echo ERROR: src.pre-responsive backup not found.
  exit /b 1
)
copy /Y "src.pre-responsive\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
echo Restored responsive list files
