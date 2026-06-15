@echo off
setlocal
if not exist "public.pre-report-lightbox\report.html" (
  echo Backup not found: public.pre-report-lightbox
  exit /b 1
)
copy /Y "public.pre-report-lightbox\report.html" "public\report.html"
echo Restored report.html from public.pre-report-lightbox
