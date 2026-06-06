@echo off
cd /d "%~dp0"
if not exist "package.json.pre-vercel" (
  echo ERROR: package.json.pre-vercel backup not found.
  exit /b 1
)
copy /Y "package.json.pre-vercel" "package.json" >nul
del "vercel.json" 2>nul
del "metro.config.js" 2>nul
echo Restored Vercel web deploy settings
