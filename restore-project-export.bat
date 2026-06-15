@echo off
setlocal
if not exist "src.pre-project-export" (
  echo Backup not found: src.pre-project-export
  exit /b 1
)
xcopy /E /I /Y "src.pre-project-export\*" "src\" >nul
if exist "public.pre-project-export\report.html" copy /Y "public.pre-project-export\report.html" "public\report.html"
if exist "vercel.json.pre-project-export" copy /Y "vercel.json.pre-project-export" "vercel.json"
echo Restored project-export feature from backups.
echo Note: npm packages jszip exceljs are not removed. Run npm uninstall jszip exceljs if needed.
