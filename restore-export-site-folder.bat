@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-export-site-folder\services\exportPdf.ts" (
  echo Backup not found: src.pre-export-site-folder
  exit /b 1
)
copy /Y "src.pre-export-site-folder\services\exportPdf.ts" "src\services\exportPdf.ts"
if exist "public.pre-export-site-folder\help.html" (
  copy /Y "public.pre-export-site-folder\help.html" "public\help.html"
)
echo Restored PDF site-folder archive from src.pre-export-site-folder
