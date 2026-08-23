@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-follow-title-seq\components\StampSaveModal.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-follow-title-seq\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
copy /Y "src.pre-follow-title-seq\services\stampRepository.ts" "src\services\stampRepository.ts" >nul
if exist "public.pre-follow-title-seq\help.html" copy /Y "public.pre-follow-title-seq\help.html" "public\help.html" >nul
echo Restored follow-title seq. Reload Metro.
endlocal
