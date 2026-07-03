@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-gallery-app-only\services\saveStamp.ts" (
  echo Backup not found: src.pre-gallery-app-only
  exit /b 1
)
copy /Y "src.pre-gallery-app-only\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-gallery-app-only\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-gallery-app-only\services\settingsService.ts" "src\services\settingsService.ts"
echo Restored gallery-app-only rollback from src.pre-gallery-app-only
