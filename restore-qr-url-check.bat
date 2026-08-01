@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-qr-url-check\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-qr-url-check
  exit /b 1
)
copy /Y "src.pre-qr-url-check\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-qr-url-check\components\SettingsScreen.tsx" (
  copy /Y "src.pre-qr-url-check\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
)
if exist "public.pre-qr-url-check\help.html" (
  copy /Y "public.pre-qr-url-check\help.html" "public\help.html"
)
if exist "src\services\qrUrlConnectCheckService.ts" (
  del /F /Q "src\services\qrUrlConnectCheckService.ts"
)
echo Restored qr-url-check from src.pre-qr-url-check / public.pre-qr-url-check
