@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-settings-fast-load\services\settingsService.ts" (
  echo Backup not found: src.pre-settings-fast-load
  exit /b 1
)
copy /Y "src.pre-settings-fast-load\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-settings-fast-load\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-settings-fast-load\help.html" "public\help.html"
echo Restored settings-fast-load rollback from src.pre-settings-fast-load
