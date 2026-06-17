@echo off
setlocal
if not exist "public.pre-report-watermark\report.html" (
  echo Backup not found: public.pre-report-watermark
  exit /b 1
)
copy /Y "public.pre-report-watermark\report.html" "public\report.html"
if exist "public\report" rmdir /S /Q "public\report"
echo Restored report.html from public.pre-report-watermark
echo Removed public\report\ (watermark export scripts)
