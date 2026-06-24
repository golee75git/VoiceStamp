@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-visitor-counter\landing.html" (
  echo Backup not found: public.pre-visitor-counter
  exit /b 1
)
copy /Y "public.pre-visitor-counter\landing.html" "public\landing.html"
copy /Y "public.pre-visitor-counter\privacy.html" "public\privacy.html"
if exist "api\visitor.js" del /Q "api\visitor.js"
if exist "api" rmdir "api" 2>nul
echo Restored landing/privacy and removed api/visitor.js from public.pre-visitor-counter
