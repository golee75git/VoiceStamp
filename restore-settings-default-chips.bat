@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-settings-default-chips\components\SettingsScreen.tsx" (
  echo Backup not found: src.pre-settings-default-chips
  exit /b 1
)
copy /Y "src.pre-settings-default-chips\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-settings-default-chips\help.html" "public\help.html"
echo Restored settings-default-chips rollback from src.pre-settings-default-chips
