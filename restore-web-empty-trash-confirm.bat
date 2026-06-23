@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-web-empty-trash-confirm\components\SettingsScreen.tsx" (
  echo Backup not found: src.pre-web-empty-trash-confirm
  exit /b 1
)
copy /Y "src.pre-web-empty-trash-confirm\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-web-empty-trash-confirm\utils\confirmAlert.ts" "src\utils\confirmAlert.ts"
echo Restored web empty trash confirm rollback from src.pre-web-empty-trash-confirm
