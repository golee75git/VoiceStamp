@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-continuous-in-app-camera\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-continuous-in-app-camera
  exit /b 1
)
copy /Y "src.pre-continuous-in-app-camera\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-continuous-in-app-camera\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-continuous-in-app-camera\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
echo Restored continuous in-app camera rollback
