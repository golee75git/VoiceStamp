@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-settings-sticky-save\components\SettingsScreen.tsx" (
  echo Backup not found: src.pre-settings-sticky-save
  exit /b 1
)
copy /Y "src.pre-settings-sticky-save\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-settings-sticky-save\help.html" "public\help.html"
echo Restored settings-sticky-save rollback from src.pre-settings-sticky-save
