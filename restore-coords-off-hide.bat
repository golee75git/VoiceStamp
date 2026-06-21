@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-coords-off-hide\services\stampCoords.ts" (
  echo Backup not found: src.pre-coords-off-hide
  exit /b 1
)
copy /Y "src.pre-coords-off-hide\services\stampCoords.ts" "src\services\stampCoords.ts"
copy /Y "src.pre-coords-off-hide\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
echo Restored coords off-hide rollback (§108)
