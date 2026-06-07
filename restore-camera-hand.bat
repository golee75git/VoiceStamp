@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-camera-hand\services\settingsService.ts" (
  echo Backup not found: src.pre-camera-hand
  exit /b 1
)
copy /Y "src.pre-camera-hand\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-camera-hand\components\CameraScreen.tsx" "src\components\CameraScreen.tsx"
copy /Y "src.pre-camera-hand\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-camera-hand\screens\MainScreen.tsx" "src\screens\MainScreen.tsx"
echo Restored camera-hand rollback from src.pre-camera-hand
