@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-perf-bundle-c\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-perf-bundle-c
  exit /b 1
)
copy /Y "src.pre-perf-bundle-c\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "public.pre-perf-bundle-c\help.html" copy /Y "public.pre-perf-bundle-c\help.html" "public\help.html"
if exist "src\services\exportOnDemand.ts" del /F /Q "src\services\exportOnDemand.ts"
echo Restored perf-bundle-c from src.pre-perf-bundle-c / public.pre-perf-bundle-c
