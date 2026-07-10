@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-floor-school-only\services\stampFloor.ts" (
  echo Backup not found: src.pre-floor-school-only
  exit /b 1
)
copy /Y "src.pre-floor-school-only\services\stampFloor.ts" "src\services\stampFloor.ts"
copy /Y "src.pre-floor-school-only\services\quickCaptureSave.ts" "src\services\quickCaptureSave.ts"
copy /Y "src.pre-floor-school-only\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-floor-school-only\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src.pre-floor-school-only\help.html" copy /Y "src.pre-floor-school-only\help.html" "public\help.html"
echo Restored floor school_only lastFloor/save guard
