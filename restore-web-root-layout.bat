@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "package.json.pre-web-root-layout" (
  echo Backup not found: package.json.pre-web-root-layout
  exit /b 1
)
copy /Y "package.json.pre-web-root-layout" "package.json"
if exist "vercel.json.pre-web-root-layout" copy /Y "vercel.json.pre-web-root-layout" "vercel.json"
if exist "scripts\post-export-web-layout.mjs" del /F "scripts\post-export-web-layout.mjs"
echo Restored web root layout rollback from package.json.pre-web-root-layout
