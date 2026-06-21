@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-continuous-capture\components\CameraScreen.tsx" (
  echo Backup not found: src.pre-continuous-capture
  exit /b 1
)
copy /Y "src.pre-continuous-capture\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-continuous-capture\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-continuous-capture\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src\services\quickCaptureSave.ts" del /Q "src\services\quickCaptureSave.ts"
echo Restored continuous capture rollback (§109)
