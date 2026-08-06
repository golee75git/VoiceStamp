@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-follow-link\services\stampRepository.ts" (
  echo Backup not found: src.pre-follow-link
  exit /b 1
)
xcopy /E /I /Y "src.pre-follow-link\*" "src\" >nul
if exist "public.pre-follow-link\help.html" (
  copy /Y "public.pre-follow-link\help.html" "public\help.html"
)
if exist "src\components\FollowLinkCompareSheet.tsx" (
  del /F /Q "src\components\FollowLinkCompareSheet.tsx"
)
echo Restored follow-link from src.pre-follow-link / public.pre-follow-link
endlocal
