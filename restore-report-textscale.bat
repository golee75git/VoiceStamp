@echo off
setlocal
if not exist "public.pre-report-textscale\report.html" (
  echo Backup not found: public.pre-report-textscale
  exit /b 1
)
copy /Y "public.pre-report-textscale\report.html" "public\report.html"
if not exist "public\report" mkdir "public\report"
copy /Y "public.pre-report-textscale\report\watermark-export.js" "public\report\watermark-export.js"
echo Restored report text-scale changes from public.pre-report-textscale
