@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-settings-bottom-bar\components\SettingsScreen.tsx" (
  echo Backup not found: src.pre-settings-bottom-bar
  exit /b 1
)
copy /Y "src.pre-settings-bottom-bar\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-settings-bottom-bar\help.html" "public\help.html"
echo Restored settings-bottom-bar rollback from src.pre-settings-bottom-bar
