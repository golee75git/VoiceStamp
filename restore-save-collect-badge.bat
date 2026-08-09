@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-save-collect-badge\components\StampSaveModal.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-save-collect-badge\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "public.pre-save-collect-badge\help.html" copy /Y "public.pre-save-collect-badge\help.html" "public\help.html" >nul
echo Restored save-collect-badge.
endlocal
