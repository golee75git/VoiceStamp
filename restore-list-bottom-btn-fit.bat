@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-list-bottom-btn-fit\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-list-bottom-btn-fit
  exit /b 1
)
copy /Y "src.pre-list-bottom-btn-fit\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src.pre-list-bottom-btn-fit\apkBuildLabel.ts" (
  copy /Y "src.pre-list-bottom-btn-fit\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
if exist "public.pre-list-bottom-btn-fit\help.html" (
  copy /Y "public.pre-list-bottom-btn-fit\help.html" "public\help.html"
)
if exist "public.pre-list-bottom-btn-fit\landing.html" (
  copy /Y "public.pre-list-bottom-btn-fit\landing.html" "public\landing.html"
)
if exist "public.pre-list-bottom-btn-fit\info.html" (
  copy /Y "public.pre-list-bottom-btn-fit\info.html" "public\info.html"
)
echo Restored list-bottom-btn-fit from src.pre-list-bottom-btn-fit / public.pre-list-bottom-btn-fit
endlocal
