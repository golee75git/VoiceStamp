@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-floor-display-mode\services\settingsService.ts" (
  echo Backup not found: src.pre-floor-display-mode
  exit /b 1
)
copy /Y "src.pre-floor-display-mode\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-floor-display-mode\services\stampFloor.ts" "src\services\stampFloor.ts"
copy /Y "src.pre-floor-display-mode\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-floor-display-mode\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-floor-display-mode\App.tsx" "App.tsx"
if exist "src\services\floorDisplayMode.ts" del /Q "src\services\floorDisplayMode.ts"
echo Restored floor display mode setting rollback (§104)
