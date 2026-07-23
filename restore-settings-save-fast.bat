@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-settings-save-fast\services\settingsService.ts" (
  echo Backup not found: src.pre-settings-save-fast
  exit /b 1
)
copy /Y "src.pre-settings-save-fast\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-settings-save-fast\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src.pre-settings-save-fast\public\help.html" copy /Y "src.pre-settings-save-fast\public\help.html" "public\help.html"
if exist "src.pre-settings-save-fast\public\landing.html" copy /Y "src.pre-settings-save-fast\public\landing.html" "public\landing.html"
if exist "src.pre-settings-save-fast\public\info.html" copy /Y "src.pre-settings-save-fast\public\info.html" "public\info.html"
if exist "src.pre-settings-save-fast\constants\apkBuildLabel.ts" copy /Y "src.pre-settings-save-fast\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored settings-save-fast from src.pre-settings-save-fast
