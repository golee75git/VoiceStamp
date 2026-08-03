@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-web-save-alert\services\fileService.ts" (
  echo Backup not found: src.pre-web-save-alert
  exit /b 1
)
copy /Y "src.pre-web-save-alert\services\fileService.ts" "src\services\fileService.ts" >nul
copy /Y "src.pre-web-save-alert\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
copy /Y "src.pre-web-save-alert\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
if exist "public.pre-web-save-alert\help.html" copy /Y "public.pre-web-save-alert\help.html" "public\help.html" >nul
echo Restored web-save-alert from src.pre-web-save-alert / public.pre-web-save-alert
