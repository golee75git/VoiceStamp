@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "vercel.json.pre-root-landing" (
  echo Backup not found: vercel.json.pre-root-landing
  exit /b 1
)
copy /Y "vercel.json.pre-root-landing" "vercel.json"
if exist "public.pre-root-landing\info.html" copy /Y "public.pre-root-landing\info.html" "public\info.html"
if exist "public.pre-root-landing\report.html" copy /Y "public.pre-root-landing\report.html" "public\report.html"
if exist "public.pre-root-landing\privacy.html" copy /Y "public.pre-root-landing\privacy.html" "public\privacy.html"
if exist "public.pre-root-landing\license.html" copy /Y "public.pre-root-landing\license.html" "public\license.html"
if exist "public.pre-root-landing\help.html" copy /Y "public.pre-root-landing\help.html" "public\help.html"
if exist "public\landing.html" del /F "public\landing.html"
echo Restored root landing rollback from public.pre-root-landing
