@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-list-display-mode\services\settingsService.ts" (
  echo Backup not found: src.pre-list-display-mode
  exit /b 1
)
copy /Y "src.pre-list-display-mode\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-list-display-mode\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-list-display-mode\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src.pre-list-display-mode\public\help.html" copy /Y "src.pre-list-display-mode\public\help.html" "public\help.html"
if exist "src.pre-list-display-mode\public\landing.html" copy /Y "src.pre-list-display-mode\public\landing.html" "public\landing.html"
if exist "src.pre-list-display-mode\public\info.html" copy /Y "src.pre-list-display-mode\public\info.html" "public\info.html"
if exist "src.pre-list-display-mode\constants\apkBuildLabel.ts" copy /Y "src.pre-list-display-mode\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored list-display-mode from src.pre-list-display-mode
