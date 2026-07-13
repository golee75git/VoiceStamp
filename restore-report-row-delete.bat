@echo off
setlocal
if not exist "public.pre-report-row-delete\report.html" (
  echo Backup not found: public.pre-report-row-delete
  exit /b 1
)
copy /Y "public.pre-report-row-delete\report.html" "public\report.html"
copy /Y "public.pre-report-row-delete\help.html" "public\help.html"
if exist "public.pre-report-row-delete\landing.html" copy /Y "public.pre-report-row-delete\landing.html" "public\landing.html"
if exist "public.pre-report-row-delete\info.html" copy /Y "public.pre-report-row-delete\info.html" "public\info.html"
echo Restored report row-delete changes from public.pre-report-row-delete
