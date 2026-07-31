@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-qr-url-mic\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-qr-url-mic
  exit /b 1
)
copy /Y "src.pre-qr-url-mic\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "public.pre-qr-url-mic\help.html" (
  copy /Y "public.pre-qr-url-mic\help.html" "public\help.html"
)
echo Restored qr-url-mic from src.pre-qr-url-mic / public.pre-qr-url-mic
