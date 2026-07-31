@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-web-security-harden\vercel.json" (
  echo Backup not found: public.pre-web-security-harden
  exit /b 1
)
copy /Y "public.pre-web-security-harden\vercel.json" "vercel.json"
if exist "public.pre-web-security-harden\report.html" copy /Y "public.pre-web-security-harden\report.html" "public\report.html"
if exist "api.pre-web-security-harden\visitor.js" copy /Y "api.pre-web-security-harden\visitor.js" "api\visitor.js"
echo Restored web-security-harden
