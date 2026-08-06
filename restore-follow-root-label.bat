@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-follow-root-label\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-follow-root-label
  exit /b 1
)
copy /Y "src.pre-follow-root-label\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "public.pre-follow-root-label\help.html" (
  copy /Y "public.pre-follow-root-label\help.html" "public\help.html"
)
echo Restored follow-root-label from src.pre-follow-root-label / public.pre-follow-root-label
endlocal
