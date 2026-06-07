@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-settings-scroll\components\SettingsScreen.tsx" (
  echo Backup not found: src.pre-settings-scroll
  exit /b 1
)
copy /Y "src.pre-settings-scroll\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
echo Restored settings scroll rollback from src.pre-settings-scroll
