@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-primary-capture-camera\services\settingsService.ts" (
  echo Backup not found: src.pre-primary-capture-camera
  exit /b 1
)
copy /Y "src.pre-primary-capture-camera\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-primary-capture-camera\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-primary-capture-camera\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-primary-capture-camera\help.html" "public\help.html"
echo Restored primary-capture-camera rollback from src.pre-primary-capture-camera
