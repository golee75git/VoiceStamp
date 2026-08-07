@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-project-inbox-qr-https\components\ProjectCollectScreen.tsx" (
  echo Backup not found
  exit /b 1
)
copy /Y "src.pre-project-inbox-qr-https\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
copy /Y "api.pre-project-inbox-qr-https\project.js" "api\project.js" >nul
if exist "public.pre-project-inbox-qr-https\help.html" copy /Y "public.pre-project-inbox-qr-https\help.html" "public\help.html" >nul
echo Restored inbox bar / QR https payload. Redeploy Vercel if api changed.
endlocal
