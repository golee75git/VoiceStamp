@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-capture-after-mode\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-capture-after-mode
  exit /b 1
)
copy /Y "src.pre-capture-after-mode\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-capture-after-mode\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-capture-after-mode\services\settingsService.ts" "src\services\settingsService.ts"
echo Restored capture-after-mode rollback
